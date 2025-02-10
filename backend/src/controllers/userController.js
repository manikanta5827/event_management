import { AuthModel } from '../models/authModel.js';
import { AppError } from '../utils/errorHandler.js';

export const getProfile = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware
        const user = await AuthModel.findById(req.user.id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_img: user.profile_img
            }
        });
    } catch (error) {
        next(error);
    }
}; 