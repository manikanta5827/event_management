import { Server } from 'socket.io';
import { EventModel } from '../models/eventModel.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    // Socket connection handler
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // New event
        socket.on('new_event', async ({ eventData, userId }) => {
            try {
                const event = await EventModel.createEvent(eventData, userId);
                io.emit('event_created', event);
                socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_CREATED });
            } catch (error) {
                socket.emit('error', {
                    message: `${ERROR_MESSAGES.EVENT_CREATE_FAILED}: ${error.message}`
                });
            }
        });

        // Update event
        socket.on('update_event', async ({ eventId, eventData, userId }) => {
            try {
                const event = await EventModel.updateEvent(eventId, eventData, userId);
                if (event) {
                    io.emit('event_updated', event);
                    socket.emit('success', { message: SUCCESS_MESSAGES.EVENT_UPDATED });
                }
            } catch (error) {
                socket.emit('error', {
                    message: error.message === ERROR_MESSAGES.NOT_EVENT_OWNER
                        ? error.message
                        : `${ERROR_MESSAGES.EVENT_UPDATE_FAILED}: ${error.message}`
                });
            }
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
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}; 