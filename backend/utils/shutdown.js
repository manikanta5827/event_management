import pool from '../config/db.js';

export const gracefulShutdown = (server) => async (signal) => {
    try {
        console.log(`\n${signal} signal received. Starting graceful shutdown...`);

        // Close server first to stop accepting new requests
        server.close(() => {
            console.log('Server closed. No longer accepting connections.');
        });

        // Close database connection pool
        await pool.end();
        console.log('Database connections closed.');

        console.log('Graceful shutdown completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};

export const setupShutdownHandlers = (server) => {
    const shutdown = gracefulShutdown(server);

    // Handle different signals
    process.on('SIGTERM', () => shutdown('SIGTERM')); // For container orchestration
    process.on('SIGINT', () => shutdown('SIGINT'));   // For Ctrl+C
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        shutdown('Uncaught Exception');
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        shutdown('Unhandled Rejection');
    });
}; 