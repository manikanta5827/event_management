import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import eventRoutes from './eventRoutes.js';

export default (app) => {
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/events', eventRoutes);

    // Health check routes
    app.get('/', (_, res) => {
        res.status(200).json({ message: 'Welcome to the Event Management API' });
    });

    app.get('/health', (_, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    // 404 handler
    app.use((_, res) => {
        res.status(404).json({ message: 'Route not found' });
    });
}; 