const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables BEFORE other imports
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const connectDB = require('./Config/db');
const { errorHandler, notFound } = require('./Middleware/errorMiddleware');
const romsService = require('./Services/romsService');

// Route files
const romsRoutes = require('./Routes/romsRoutes');
const drugRoutes = require('./Routes/drugRoutes');
const cancellationRoutes = require('./Routes/cancellationRoutes');
const routingRoutes = require('./Routes/routingRoutes');


// Connect to Database

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'MediReach API',
            version: '1.0.0',
            description: 'MediReach Backend RESTful API with ROMS',
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./Routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Scheduled Jobs (Component 3: Auto-Expiry)
// Runs every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running Auto-Expiry background task...');
    try {
        const result = await romsService.expireOldRequests();
        console.log(`Auto-Expiry completed. Modified ${result.modifiedCount} requests.`);
    } catch (error) {
        console.error('Auto-Expiry job failed:', error.message);
    }
});

// Routes
app.use('/api/roms', romsRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/cancellations', cancellationRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Base route
app.get('/', (req, res) => {
    res.send('MediReach API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});