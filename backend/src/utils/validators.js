import { AppError } from './errorHandler.js';

export const validateGuestAccess = () => {
    const guestLoginEnabled = process.env.ALLOW_GUEST_LOGIN === 'true';
    if (!guestLoginEnabled) {
        throw new AppError('Guest login is not allowed', 403);
    }
}; 
