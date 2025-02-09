import express from 'express';
import { register, login, guestLogin, logout } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { userSchemas } from '../utils/validationSchemas.js';

const router = express.Router();

router.post('/register', validateRequest(userSchemas.register), register);
router.post('/login', validateRequest(userSchemas.login), login);
router.post('/guest-login', guestLogin);
router.post('/logout', authMiddleware, logout);

export default router; 