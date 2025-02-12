import { EventModel } from '../models/eventModel.js';

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await EventModel.getAllEvents(req.user?.id);
        console.log(events)
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

export const getGuestEvents = async (req, res, next) => {
    try {
        const events = await EventModel.getGuestEvents();
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        next(error);
    }
}; 