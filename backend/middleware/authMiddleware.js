import { verifyToken } from '../config/jwt.js';
import { AppError } from '../utils/errorHandler.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError('Authentication required', 401);
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        next(new AppError('Invalid or expired token', 401));
    }
};

export default authMiddleware; 