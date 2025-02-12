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
        console.log('✨ Event created:', event);

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
        console.log('✨ Event updated:', event);

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

        const result = await EventModel.deleteEvent(eventId, userId);
        if (result) {
            console.log(`✨ Event ${eventId} deleted successfully`);
            // Send success response to creator
            callback({ success: true });
            
            // Broadcast to other clients
            socket.broadcast.emit('event_deleted', { 
                eventId, 
                eventName: result.name
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

socket.on('attendee_update', ({ eventId, attendeeCount }) => {
    console.log(`👥 Attendee update request received for event ${eventId}`);
    socket.broadcast.emit('attendee_update', { 
        eventId, 
        attendeeCount,
        eventName: event.name,
        action: 'joined/left',
        userName: user.name
    });
}); 