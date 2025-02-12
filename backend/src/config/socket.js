import { Server } from 'socket.io';
import { EventModel } from '../models/eventModel.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { cloudinaryImageUpload } from './cloudinary.js';
import { checkConnection } from './db.js';
import { AppError } from '../utils/errorHandler.js';

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

    io.on('connection', (socket) => {
        console.log(`🟢 Client connected: ${socket.id}`);

        const handleEvent = async (eventName, handler) => {
            try {
                // Check database connection before proceeding
                const isConnected = await checkConnection();
                if (!isConnected) {
                    throw new AppError('Database connection error. Please try again.', 500);
                }

                const result = await handler();
                if (result.broadcast) {
                    console.log(`📢 Broadcasting ${result.broadcast.event}:`, result.broadcast.data);
                    socket.broadcast.emit(result.broadcast.event, result.broadcast.data);
                }
                console.log(`✅ ${eventName} success:`, result.message);
                socket.emit('success', {
                    event: eventName,
                    message: result.message
                });
            } catch (error) {
                console.error(`❌ ${eventName} error:`, error);
                socket.emit('error', {
                    event: eventName,
                    message: error.message || 'An unexpected error occurred'
                });
            }
        };

        // Event handlers
        socket.on('new_event', async ({ eventData, userId }) => {
            console.log(`📝 New event request received from user ${userId}:`);
            if (!userId) {
                socket.emit('error', { message: ERROR_MESSAGES.UNAUTHORIZED });
                return;
            }

            await handleEvent('new_event', async () => {
                console.log('🖼️ Uploading event image...');
                const imageUrl = await cloudinaryImageUpload(eventData.cover_image, 'events');
                console.log('📸 Image uploaded:', imageUrl);

                const event = await EventModel.createEvent({
                    ...eventData,
                    cover_image: imageUrl
                }, userId);
                console.log('✨ Event created:', event);

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
            console.log(`🔄 Update event request received for event ${eventId} from user ${userId}:`);
            if (!userId) {
                socket.emit('error', { message: ERROR_MESSAGES.UNAUTHORIZED });
                return;
            }

            await handleEvent('update_event', async () => {
                let imageUrl = eventData.cover_image;
                if (eventData.cover_image && !eventData.cover_image.startsWith('http')) {
                    console.log('🖼️ Uploading new event image...');
                    imageUrl = await cloudinaryImageUpload(eventData.cover_image, 'events');
                    console.log('📸 New image uploaded:', imageUrl);
                }

                const event = await EventModel.updateEvent(eventId, {
                    ...eventData,
                    cover_image: imageUrl
                }, userId);
                console.log('✨ Event updated:', event);

                return {
                    broadcast: {
                        event: 'event_updated',
                        data: event
                    },
                    message: SUCCESS_MESSAGES.EVENT_UPDATED
                };
            });
        });

        socket.on('delete_event', async ({ eventId, userId }) => {
            console.log(`🗑️ Delete event request received for event ${eventId} from user ${userId}`);
            try {
                const result = await EventModel.deleteEvent(eventId, userId);
                if (result) {
                    console.log(`✨ Event ${eventId} deleted successfully`);
                    socket.broadcast.emit('event_deleted', eventId);
                    socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_DELETED });
                }
            } catch (error) {
                console.error(`❌ Delete event error:`, error.message);
                socket.emit('error', {
                    message: error.message === ERROR_MESSAGES.NOT_EVENT_OWNER
                        ? error.message
                        : `${ERROR_MESSAGES.EVENT_DELETE_FAILED}: ${error.message}`
                });
            }
        });

        socket.on('join_event', async ({ userId, eventId }) => {
            console.log(`➕ Join event request received for event ${eventId} from user ${userId}`);
            try {
                const attendeeCount = await EventModel.joinEvent(eventId, userId);
                console.log(`✨ User ${userId} joined event ${eventId}. New attendee count:`, attendeeCount);
                socket.broadcast.emit('attendee_update', { eventId, attendeeCount });
                socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_JOINED });
            } catch (error) {
                console.error(`❌ Join event error:`, error.message);
                socket.emit('error', {
                    message: error.message === ERROR_MESSAGES.ALREADY_JOINED
                        ? error.message
                        : `${ERROR_MESSAGES.EVENT_JOIN_FAILED}: ${error.message}`
                });
            }
        });

        socket.on('leave_event', async ({ userId, eventId }) => {
            console.log(`➖ Leave event request received for event ${eventId} from user ${userId}`);
            try {
                const attendeeCount = await EventModel.leaveEvent(eventId, userId);
                console.log(`✨ User ${userId} left event ${eventId}. New attendee count:`, attendeeCount);
                socket.broadcast.emit('attendee_update', { eventId, attendeeCount });
                socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_LEFT });
            } catch (error) {
                console.error(`❌ Leave event error:`, error.message);
                socket.emit('error', {
                    message: `${ERROR_MESSAGES.EVENT_LEAVE_FAILED}: ${error.message}`
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔴 Client disconnected: ${socket.id}`);
            connectedClients.delete(socket.id);
        });
    });

    // Cleanup on server shutdown
    process.on('SIGTERM', () => {
        console.log('🔄 Closing socket connections...');
        io.close(() => {
            console.log('✅ Socket server closed');
        });
    });

    return io;
}; 