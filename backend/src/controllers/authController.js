import bcrypt from 'bcrypt';
import { generateToken } from '../config/jwt.js';
import { AppError } from '../utils/errorHandler.js';
import cloudinaryImageUpload from '../config/cloudinary.js';
import { validateGuestAccess } from '../utils/validators.js';
import { AuthModel } from '../models/authModel.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

// Cookie options based on environment
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password, profile_image } = req.body;

        // Check if user exists
        const emailExists = await AuthModel.emailExists(email);
        if (emailExists) {
            throw new AppError(ERROR_MESSAGES.EMAIL_EXISTS, 400);
        }

        // Upload image to cloudinary if provided
        const profileImageUrl = await cloudinaryImageUpload(profile_image, 'profile_images');
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await AuthModel.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl
        });

        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.REGISTER
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await AuthModel.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }

        const token = generateToken(user, 'user');

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.json({
            success: true,
            message: SUCCESS_MESSAGES.LOGIN
        });
    } catch (error) {
        next(error);
    }
};

export const guestLogin = async (req, res, next) => {
    try {
        // Validate guest access
        validateGuestAccess();

        // Create a guest user
        const guestUser = {
            id: 'guest-' + Date.now(),
            name: 'Guest User',
            profile_img: '',
        };

        const token = generateToken(guestUser, 'guest');

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.json({
            success: true,
            message: SUCCESS_MESSAGES.LOGIN
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        // Clear cookie
        res.clearCookie('token', cookieOptions);

        res.json({
            success: true,
            message: SUCCESS_MESSAGES.LOGOUT
        });
    } catch (error) {
        next(error);
    }
}; 