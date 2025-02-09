import express from 'express';
import { getProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route - requires authentication
router.get('/me', authMiddleware, getProfile);

export default router; 