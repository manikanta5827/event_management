import { Server } from 'socket.io';
import { EventModel } from '../models/eventModel.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import cloudinaryImageUpload from './cloudinary.js';

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Track connected clients for better monitoring
    const connectedClients = new Map();

    // Rate limiting for event creation/updates
    const rateLimiter = new Map();
    const RATE_LIMIT = 5; // requests per minute
    const RATE_WINDOW = 60 * 1000; // 1 minute

    const checkRateLimit = (userId) => {
        const now = Date.now();
        const userRequests = rateLimiter.get(userId) || [];
        const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

        if (recentRequests.length >= RATE_LIMIT) {
            return false;
        }

        recentRequests.push(now);
        rateLimiter.set(userId, recentRequests);
        return true;
    };

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        const handleEvent = async (eventName, handler) => {
            try {
                const result = await handler();
                if (result.broadcast) {
                    io.emit(result.broadcast.event, result.broadcast.data);
                }
                socket.emit('success', {
                    event: eventName,
                    message: result.message
                });
            } catch (error) {
                socket.emit('error', {
                    event: eventName,
                    message: error.message
                });
                console.error(`Socket error (${eventName}):`, error);
            }
        };

        // Event handlers
        socket.on('new_event', async ({ eventData, userId }) => {
            if (!userId || !checkRateLimit(userId)) {
                socket.emit('error', { message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED });
                return;
            }

            await handleEvent('new_event', async () => {
                const imageUrl = await cloudinaryImageUpload(eventData.cover_image, 'events');
                const event = await EventModel.createEvent({
                    ...eventData,
                    cover_image: imageUrl
                }, userId);

                return {
                    broadcast: {
                        event: 'event_created',
                        data: event
                    },
                    message: SUCCESS_MESSAGES.EVENT_CREATED
                };
            });
        });

        socket.on('update_event', async ({ eventId, eventData, userId }) => {
            if (!userId || !checkRateLimit(userId)) {
                socket.emit('error', { message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED });
                return;
            }

            await handleEvent('update_event', async () => {
                let imageUrl = eventData.cover_image;
                if (eventData.cover_image && !eventData.cover_image.startsWith('http')) {
                    imageUrl = await cloudinaryImageUpload(eventData.cover_image, 'events');
                }

                const event = await EventModel.updateEvent(eventId, {
                    ...eventData,
                    cover_image: imageUrl
                }, userId);

                return {
                    broadcast: {
                        event: 'event_updated',
                        data: event
                    },
                    message: SUCCESS_MESSAGES.EVENT_UPDATED
                };
            });
        });

        // Delete event
        socket.on('delete_event', async ({ eventId, userId }) => {
            try {
                const result = await EventModel.deleteEvent(eventId, userId);
                if (result) {
                    io.emit('event_deleted', eventId);
                    socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_DELETED });
                }
            } catch (error) {
                socket.emit('error', {
                    message: error.message === ERROR_MESSAGES.NOT_EVENT_OWNER
                        ? error.message
                        : `${ERROR_MESSAGES.EVENT_DELETE_FAILED}: ${error.message}`
                });
            }
        });

        // Join event
        socket.on('join_event', async ({ userId, eventId }) => {
            try {
                const attendeeCount = await EventModel.joinEvent(eventId, userId);
                io.emit('attendee_update', { eventId, attendeeCount });
                socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_JOINED });
            } catch (error) {
                socket.emit('error', {
                    message: error.message === ERROR_MESSAGES.ALREADY_JOINED
                        ? error.message
                        : `${ERROR_MESSAGES.EVENT_JOIN_FAILED}: ${error.message}`
                });
            }
        });

        // Leave event
        socket.on('leave_event', async ({ userId, eventId }) => {
            try {
                const attendeeCount = await EventModel.leaveEvent(eventId, userId);
                io.emit('attendee_update', { eventId, attendeeCount });
                socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_LEFT });
            } catch (error) {
                socket.emit('error', {
                    message: `${ERROR_MESSAGES.EVENT_LEAVE_FAILED}: ${error.message}`
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            connectedClients.delete(socket.id);
        });
    });

    // Cleanup on server shutdown
    process.on('SIGTERM', () => {
        console.log('Closing socket connections...');
        io.close(() => {
            console.log('Socket server closed');
        });
    });

    return io;
}; 