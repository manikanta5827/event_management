import { verifyToken } from '../config/jwt.js';
import { AppError } from '../utils/errorHandler.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError('Authentication token is missing', 401);
        }

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            throw new AppError('Invalid or expired token', 401);
        }
    } catch (error) {
        if (req.cookies.token) {
            res.clearCookie('token');
        }
        next(error);
    }
};

export default authMiddleware; 