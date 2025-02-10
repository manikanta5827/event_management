import { EventModel } from '../models/eventModel.js';

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await EventModel.getAllEvents(req.user?.id);
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        next(error);
    }
}; 