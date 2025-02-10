import dotenv from 'dotenv';
import { validateEnv } from './utils/validateEnv.js';
import app from './config/express.js';
import { errorHandler } from './utils/errorHandler.js';
import createTables from './config/tables.js';
import setupRoutes from './routes/index.js';
import { swaggerDocs } from './utils/swagger.js';
import { setupShutdownHandlers } from './utils/shutdown.js';
import { setupSocket } from './config/socket.js';
import express from 'express';

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 4000;

// Validate environment variables
validateEnv();

// Initialize database tables
createTables().catch(console.error);

// Setup Swagger - must be before routes
swaggerDocs(app);

// Setup routes
setupRoutes(app);

// Update these middleware configurations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`📝 API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Setup Socket.IO
setupSocket(server);

// Setup graceful shutdown
setupShutdownHandlers(server);

export default app;

