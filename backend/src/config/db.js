import pg from 'pg';
import dotenv from 'dotenv';
import { AppError } from '../utils/errorHandler.js';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Add error handler for the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Add connection check function
export const checkConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
};

export default pool;