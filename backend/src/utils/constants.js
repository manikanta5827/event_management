export const SUCCESS_MESSAGES = {
    // Auth
    REGISTER: 'Registration successful! Please check your email to verify your account.',
    LOGIN: 'Welcome back! Login successful.',
    LOGOUT: 'You have been successfully logged out.',
    
    // Events
    EVENT_CREATED: 'Your event has been successfully created.',
    EVENT_UPDATED: 'Event details have been updated successfully.',
    EVENT_DELETED: 'Event has been deleted successfully.',
    EVENT_JOINED: 'You have successfully joined the event.',
    EVENT_LEFT: 'You have left the event successfully.'
};

export const ERROR_MESSAGES = {
    // Auth
    INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
    EMAIL_EXISTS: 'This email is already registered. Please use a different email.',
    UNAUTHORIZED: 'Please log in to access this feature.',
    INVALID_TOKEN: 'Your session has expired. Please log in again.',
    
    // Events
    EVENT_NOT_FOUND: 'The event you are looking for does not exist.',
    EVENT_CREATE_FAILED: 'Unable to create event. Please try again.',
    EVENT_UPDATE_FAILED: 'Failed to update event. Please try again.',
    EVENT_DELETE_FAILED: 'Unable to delete event. Please try again.',
    EVENT_JOIN_FAILED: 'Unable to join event. Please try again.',
    EVENT_LEAVE_FAILED: 'Unable to leave event. Please try again.',
    NOT_EVENT_OWNER: 'You do not have permission to modify this event.',
    ALREADY_JOINED: 'You are already registered for this event.',
    
    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again in a minute.',
    
    // Database
    DB_ERROR: 'A database error occurred. Please try again.',
    
    // Upload
    IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again.',
    
    // General
    INVALID_INPUT: 'Please check your input and try again.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.'
}; 