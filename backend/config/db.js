import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database', err.stack);
        throw err;
    }
    console.log('Connected to PostgreSQL database');
});


pool.on('error', (err) => {
    console.error('Unexpected error on the PostgreSQL client', err);
    process.exit(-1);
});
export default pool; 