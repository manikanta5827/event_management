import bcrypt from 'bcrypt';
import { generateToken } from '../config/jwt.js';
import { AppError } from '../utils/errorHandler.js';
import cloudinaryImageUpload from '../config/cloudinary.js';
import { validateSession, validateGuestAccess } from '../utils/validators.js';
import { AuthModel } from '../models/authModel.js';

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
            throw new AppError('Email already registered', 400);
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
            message: 'Registration successful. Please login.'
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
        if (!user) {
            throw new AppError('User not found', 401);
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError('Password is incorrect', 401);
        }

        const token = generateToken(user);

        // Set cookie
        res.cookie('token', token, cookieOptions);

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

export const guestLogin = async (req, res, next) => {
    try {
        // Validate guest access
        validateGuestAccess();

        // Create a guest user
        const guestUser = {
            id: 'guest-' + Date.now(),
            name: 'Guest User',
            role: 'guest'
        };

        const token = generateToken(guestUser);

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.json({
            success: true,
            user: { id: guestUser.id, name: guestUser.name, role: guestUser.role }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        // Clear cookie
        res.clearCookie('token', {
            ...cookieOptions,
            maxAge: 0
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
}; 