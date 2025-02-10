import { AppError } from '../utils/errorHandler.js';

export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.validateSync(req.body, { abortEarly: false });
            next();
        } catch (error) {
            next(new AppError(error.message, 400));
        }
    };
}; 