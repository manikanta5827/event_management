import { Server } from 'socket.io';
import { EventModel } from '../models/eventModel.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { cloudinaryImageUpload, cloudinaryImageDelete } from './cloudinary.js';
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

        // Event handlers
        socket.on('new_event', async ({ eventData, userId }, callback) => {
            console.log(`📝 New event request received from user ${userId}:`);
            if (!userId) {
                callback({ success: false, error: ERROR_MESSAGES.UNAUTHORIZED });
                return;
            }

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    throw new AppError('Database connection error. Please try again.', 500);
                }

                console.log('🖼️ Uploading event image...');
                const imageUrl = await cloudinaryImageUpload(eventData.cover_image, 'events');
                console.log('📸 Image uploaded:', imageUrl);

                const event = await EventModel.createEvent({
                    ...eventData,
                    cover_image: imageUrl
                }, userId);
                // console.log('✨ Event created:', event);

                // Send success response to creator
                callback({ success: true, event });

                // Broadcast to other clients
                socket.broadcast.emit('event_created', event);
            } catch (error) {
                console.error(`❌ New event error:`, error);
                callback({ success: false, error: error.message });
            }
        });

        socket.on('update_event', async ({ eventId, eventData, userId }, callback) => {
            console.log(`🔄 Update event request received for event ${eventId} from user ${userId}:`);
            if (!userId) {
                callback({ success: false, error: ERROR_MESSAGES.UNAUTHORIZED });
                return;
            }

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    throw new AppError('Database connection error. Please try again.', 500);
                }

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
                // console.log('✨ Event updated:', event);

                // Send success response to creator
                callback({ success: true, event });

                // Broadcast to other clients
                socket.broadcast.emit('event_updated', event);
            } catch (error) {
                console.error(`❌ Update event error:`, error);
                callback({ success: false, error: error.message });
            }
        });

        socket.on('delete_event', async ({ eventId, userId }, callback) => {
            console.log(`🗑️ Delete event request received for event ${eventId} from user ${userId}`);
            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    throw new AppError('Database connection error. Please try again.', 500);
                }

                // Get event details before deletion
                const event = await EventModel.getEvent(eventId);
                if (!event) {
                    throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, 404);
                }

                // Delete event from database
                const result = await EventModel.deleteEvent(eventId, userId);
                if (result) {
                    // Delete image from Cloudinary if it exists
                    if (event.cover_image) {
                        console.log('🗑️ Deleting event image from Cloudinary...');
                        await cloudinaryImageDelete(event.cover_image);
                        console.log('✨ Event image deleted successfully');
                    }

                    console.log(`✨ Event ${eventId} deleted successfully`);

                    // Send success response to creator
                    callback({ success: true });

                    // Broadcast to other clients with event details
                    socket.broadcast.emit('event_deleted', {
                        eventId: eventId,
                        eventName: event.name
                    });
                }
            } catch (error) {
                console.error(`❌ Delete event error:`, error.message);
                callback({
                    success: false,
                    error: error.message === ERROR_MESSAGES.NOT_EVENT_OWNER
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