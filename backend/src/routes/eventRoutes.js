import express from 'express';
import { getAllEvents, getGuestEvents } from '../controllers/eventController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events (authenticated users)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all events with user-specific data
 */
router.get('/', authMiddleware, getAllEvents);

/**
 * @swagger
 * /api/events/guest:
 *   get:
 *     summary: Get public events (no authentication required)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of upcoming and past events with attendee counts
 */
router.get('/guest', getGuestEvents);

export default router; 