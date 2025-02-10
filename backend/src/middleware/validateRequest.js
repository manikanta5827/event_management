import { AppError } from '../utils/errorHandler.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

export const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        next(new AppError(
            `${ERROR_MESSAGES.INVALID_INPUT}: ${error.errors.join(', ')}`,
            400
        ));
    }
};  