import { verifyToken } from '../config/jwt.js';
import { AppError } from '../utils/errorHandler.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        // console.log(req.headers)
        const authHeader = req.headers.authorization;
        let token;
        // console.log(token)
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

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
        next(error);
    }
};

export default authMiddleware; 