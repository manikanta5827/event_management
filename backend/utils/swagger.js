import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Management API',
            version: '1.0.0',
            description: 'API documentation for Event Management System'
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-production-url.com'
                    : 'http://localhost:4000',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: [join(__dirname, '../routes/*.js')]
};

const specs = swaggerJsdoc(options);

// Custom Swagger UI options to handle cookies
const swaggerUiOptions = {
    swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true
    }
};

export const swaggerDocs = (app, port) => {
    // Middleware to handle CORS for Swagger UI
    app.use('/docs', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        next();
    });

    // Swagger page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        swaggerOptions: {
            persistAuthorization: true
        },
        customCss: '.swagger-ui .topbar { display: none }'
    }));

    // Docs in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    console.log(`📝 Docs available at http://localhost:${port}/docs`);
}; 