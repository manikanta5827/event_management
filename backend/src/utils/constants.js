export const SUCCESS_MESSAGES = {
    // Auth
    REGISTER: 'Registration successful. Please login.',
    LOGIN: 'Login successful',
    LOGOUT: 'Logged out successfully',
    
    // Events
    EVENT_CREATED: 'Event created successfully',
    EVENT_UPDATED: 'Event updated successfully',
    EVENT_DELETED: 'Event deleted successfully',
    EVENT_JOINED: 'Successfully joined event',
    EVENT_LEFT: 'Successfully left event'
};

export const ERROR_MESSAGES = {
    // Auth
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    UNAUTHORIZED: 'Authentication required',
    INVALID_TOKEN: 'Invalid or expired token',
    
    // Events
    EVENT_NOT_FOUND: 'Event not found',
    EVENT_CREATE_FAILED: 'Failed to create event',
    EVENT_UPDATE_FAILED: 'Failed to update event',
    EVENT_DELETE_FAILED: 'Failed to delete event',
    EVENT_JOIN_FAILED: 'Failed to join event',
    EVENT_LEAVE_FAILED: 'Failed to leave event',
    NOT_EVENT_OWNER: 'Not authorized to modify this event',
    ALREADY_JOINED: 'Already joined this event',
    
    // Database
    DB_ERROR: 'Database operation failed',
    
    // General
    INVALID_INPUT: 'Invalid input data',
    SERVER_ERROR: 'Internal server error'
}; 