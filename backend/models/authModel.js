import pool from '../config/db.js';
import { AppError } from '../utils/errorHandler.js';
export const AuthModel = {
    // Find user by email
    findByEmail: async (email) => {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await pool.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw new AppError('Database error while finding user', 500);
        }
    },

    // Create new user with transaction
    create: async ({ name, email, password, profileImageUrl }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const query = `
                INSERT INTO users (name, email, password, profile_img) 
                VALUES ($1, $2, $3, $4) 
                RETURNING id, name, profile_img
            `;
            const values = [name, email, password, profileImageUrl];
            const result = await client.query(query, values);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new AppError('Error creating user', 500);
        } finally {
            client.release();
        }
    },

    // Check if email exists
    emailExists: async (email) => {
        try {
            const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
            const result = await pool.query(query, [email]);
            return result.rows[0].exists;
        } catch (error) {
            throw new AppError('Database error while checking email', 500);
        }
    },

    // Get user by ID
    findById: async (id) => {
        try {
            const query = 'SELECT id, name, email, profile_img FROM users WHERE id = $1';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new AppError('Database error while finding user by ID', 500);
        }
    }
}; 