import { verifyToken } from '../config/jwt.js';
import { AppError } from '../utils/errorHandler.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
        }

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, 401);
        }
    } catch (error) {
        if (req.cookies.token) {
            res.clearCookie('token');
        }
        next(error);
    }
};

export default authMiddleware; 