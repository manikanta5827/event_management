import pool from '../config/db.js';
import { AppError } from '../utils/errorHandler.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

export const EventModel = {
    getAllEvents: async (userId) => {
        try {
            const now = new Date().toISOString();

            const queries = {
                upcoming: `
                    SELECT e.*, u.name as creator_name
                    FROM events e
                    LEFT JOIN users u ON e.created_by = u.id
                    WHERE e.date_time >= $1
                    ORDER BY e.date_time ASC
                `,
                past: `
                    SELECT e.*, u.name as creator_name
                    FROM events e
                    LEFT JOIN users u ON e.created_by = u.id
                    WHERE e.date_time < $1
                    ORDER BY e.date_time DESC
                `,
                userEvents: `
                    SELECT e.id as event_id, e.name as event_name
                    FROM attendees a
                    JOIN events e ON a.event_id = e.id
                    WHERE a.user_id = $1
                `,
                attendeeCounts: `
                    SELECT event_id, COUNT(*) as attendee_count
                    FROM attendees
                    GROUP BY event_id
                `
            };

            const [upcomingEvents, pastEvents, userEvents, attendeeCounts] = await Promise.all([
                pool.query(queries.upcoming, [now]),
                pool.query(queries.past, [now]),
                userId ? pool.query(queries.userEvents, [userId]) : { rows: [] },
                pool.query(queries.attendeeCounts)
            ]);

            return {
                upcoming: upcomingEvents.rows,
                past: pastEvents.rows,
                userEvents: userEvents.rows,
                attendeeCounts: attendeeCounts.rows.reduce((acc, curr) => {
                    acc[curr.event_id] = parseInt(curr.attendee_count);
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Error in getAllEvents:', error);
            throw new AppError(ERROR_MESSAGES.DB_ERROR, 500);
        }
    },

    createEvent: async (eventData, userId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const query = `
                INSERT INTO events (name, description, date_time, category, cover_image, location, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [
                eventData.name,
                eventData.description,
                eventData.date_time,
                eventData.category,
                eventData.cover_image,
                eventData.location,
                userId
            ];
            const result = await client.query(query, values);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new AppError(
                error.code === '23505' ? ERROR_MESSAGES.EVENT_EXISTS
                    : ERROR_MESSAGES.EVENT_CREATE_FAILED,
                500
            );
        } finally {
            client.release();
        }
    },

    updateEvent: async (eventId, eventData, userId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check ownership
            const event = await client.query(
                'SELECT * FROM events WHERE id = $1', [eventId]
            );

            if (!event.rows[0]) {
                throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, 404);
            }

            if (event.rows[0].created_by !== userId) {
                throw new AppError(ERROR_MESSAGES.NOT_EVENT_OWNER, 403);
            }

            const query = `
                UPDATE events 
                SET name = $1, description = $2, date_time = $3, 
                    category = $4, cover_image = $5, location = $6
                WHERE id = $7
                RETURNING *
            `;
            const values = [
                eventData.name,
                eventData.description,
                eventData.date_time,
                eventData.category,
                eventData.cover_image,
                eventData.location,
                eventId
            ];
            const result = await client.query(query, values);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error instanceof AppError ? error : new AppError(ERROR_MESSAGES.EVENT_UPDATE_FAILED, 500);
        } finally {
            client.release();
        }
    },

    deleteEvent: async (eventId, userId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check ownership
            const event = await client.query(
                'SELECT * FROM events WHERE id = $1', [eventId]
            );

            if (!event.rows[0]) {
                throw new AppError('Event not found', 404);
            }

            if (event.rows[0].created_by !== userId) {
                throw new AppError('Not authorized to delete this event', 403);
            }

            await client.query('DELETE FROM attendees WHERE event_id = $1', [eventId]);
            await client.query('DELETE FROM events WHERE id = $1', [eventId]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    joinEvent: async (eventId, userId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                'INSERT INTO attendees (event_id, user_id) VALUES ($1, $2)',
                [eventId, userId]
            );
            const count = await client.query(
                'SELECT COUNT(*) as count FROM attendees WHERE event_id = $1',
                [eventId]
            );
            await client.query('COMMIT');
            return count.rows[0].count;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    leaveEvent: async (eventId, userId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                'DELETE FROM attendees WHERE event_id = $1 AND user_id = $2',
                [eventId, userId]
            );
            const count = await client.query(
                'SELECT COUNT(*) as count FROM attendees WHERE event_id = $1',
                [eventId]
            );
            await client.query('COMMIT');
            return count.rows[0].count;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    getGuestEvents: async () => {
        try {
            const now = new Date().toISOString();

            const queries = {
                upcoming: `
                    SELECT e.*, u.name as creator_name
                    FROM events e
                    LEFT JOIN users u ON e.created_by = u.id
                    WHERE e.date_time >= $1
                    ORDER BY e.date_time ASC
                `,
                past: `
                    SELECT e.*, u.name as creator_name
                    FROM events e
                    LEFT JOIN users u ON e.created_by = u.id
                    WHERE e.date_time < $1
                    ORDER BY e.date_time DESC
                `,
                attendeeCounts: `
                    SELECT event_id, COUNT(*) as attendee_count
                    FROM attendees
                    GROUP BY event_id
                `
            };

            // Run all queries in parallel
            const [upcomingEvents, pastEvents, attendeeCounts] = await Promise.all([
                pool.query(queries.upcoming, [now]),
                pool.query(queries.past, [now]),
                pool.query(queries.attendeeCounts)
            ]);

            return {
                upcoming: upcomingEvents.rows,
                past: pastEvents.rows,
                attendeeCounts: attendeeCounts.rows.reduce((acc, curr) => {
                    acc[curr.event_id] = parseInt(curr.attendee_count);
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Error in getGuestEvents:', error);
            throw new AppError(ERROR_MESSAGES.DB_ERROR, 500);
        }
    }
}; 