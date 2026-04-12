// MediReach Backend Application
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const dns = require('dns');


// Helper: safe require to avoid startup crashes if optional modules/files aren't present
function tryRequire(path) {
    try {
        return require(path);
    } catch (err) {
        return null;
    }
}

// Attempt to load optional project utilities
const connectDB = tryRequire('./Config/db') || tryRequire('./config/db');
const errorMiddleware = tryRequire('./Middleware/errorMiddleware') || tryRequire('./middleware/errorMiddleware');
const romsService = tryRequire('./Services/romsService') || tryRequire('./services/romsService');

// Route modules (try multiple possible paths/ples)
const routes_medicine = tryRequire('./Route/medicineRoute') || tryRequire('./Routes/medicineRoute') || tryRequire('./routes/medicineRoute');
const dashboardRoutes = tryRequire('./Route/dashboardRoute') || tryRequire('./Routes/dashboardRoute') || tryRequire('./routes/dashboardRoute');
const reportRoutes = tryRequire('./Routes/reportRoutes') || tryRequire('./routes/reportRoutes') || tryRequire('./Routes/reports') || tryRequire('./routes/reportRoutes');

const authRoutes = tryRequire('./Routes/authRoutes') || tryRequire('./routes/authRoutes') || tryRequire('./routes/authRoutes.js');
const userRoutes = tryRequire('./Routes/userRoutes') || tryRequire('./routes/userRoutes');
const pharmacyRoutes = tryRequire('./Routes/pharmacyRoutes') || tryRequire('./routes/pharmacyRoutes');
const inquiryRoutes = tryRequire('./Routes/inquiryRoutes') || tryRequire('./routes/inquiryRoutes');
const chatRoutes = tryRequire('./Routes/chatRoutes') || tryRequire('./routes/chatRoutes');
const messageRoutes = tryRequire('./Routes/messageRoutes') || tryRequire('./routes/messageRoutes');

// Additional routes from other branch
const romsRoutes = tryRequire('./Routes/romsRoutes') || tryRequire('./routes/romsRoutes');
const drugRoutes = tryRequire('./Routes/drugRoutes') || tryRequire('./routes/drugRoutes');
const cancellationRoutes = tryRequire('./Routes/cancellationRoutes') || tryRequire('./routes/cancellationRoutes');
const routingRoutes = tryRequire('./Routes/routingRoutes') || tryRequire('./routes/routingRoutes');


// DNS override for +srv connections (helps in some environments)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // ignore if not supported in environment
}

const app = express();

// Middleware
app.use(express.json());
// Use a permissive CORS config but prefer explicit origins if needed
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001' , 'https://medi-reach-virid.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger (only if swagger-jsdoc is available)
let swaggerDocs;
try {
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'MediReach API',
                version: '1.0.0',
                description: 'MediReach Backend RESTful API',
            },
            servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
        },
        apis: ['./Routes/*.js', './routes/*.js'],
    };
    swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} catch (e) {
    // swagger not available — continue without docs
}

// Scheduled background job (auto-expiry) if romsService exists
if (process.env.NODE_ENV !== 'test' && romsService && romsService.expireOldRequests) {
    cron.schedule('0 * * * *', async () => {
        console.log('Running Auto-Expiry background task...');
        try {
            const result = await romsService.expireOldRequests();
            console.log(`Auto-Expiry completed. Modified ${result.modifiedCount} requests.`);
        } catch (error) {
            console.error('Auto-Expiry job failed:', error.message || error);
        }
    });
}

// Mount known routes when present
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (pharmacyRoutes) app.use('/api/pharmacies', pharmacyRoutes);
if (inquiryRoutes) app.use('/api/inquiries', inquiryRoutes);
if (chatRoutes) app.use("/api/chat", chatRoutes);
if (messageRoutes) app.use("/api/messages", messageRoutes);

if (routes_medicine) app.use('/medicines', routes_medicine);
if (dashboardRoutes) app.use('/api/dashboard', dashboardRoutes);
if (reportRoutes) app.use('/api/reports', reportRoutes);

if (romsRoutes) app.use('/api/roms', romsRoutes);
if (drugRoutes) app.use('/api/drugs', drugRoutes);
if (cancellationRoutes) app.use('/api/cancellations', cancellationRoutes);
if (routingRoutes) app.use('/api/routing', routingRoutes);


// Simple health/test routes
app.get('/test', (req, res) => {
    console.log('TEST ROUTE HIT!');
    res.json({ message: 'Test route is working!' });
});

app.get('/', (req, res) => {
    res.send('MediReach API is running');
});

// Error handling middleware (if available)
if (errorMiddleware) {
    if (errorMiddleware.notFound) app.use(errorMiddleware.notFound);
    if (errorMiddleware.errorHandler) app.use(errorMiddleware.errorHandler);
}

// Database connection: prefer connectDB() if provided, otherwise use mongoose.connect
const startServer = async () => {
    const PORT = process.env.PORT || 5000;

    try {
        // Check if already connected (for integration tests)
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Already connected to MongoDB');
        } else if (connectDB && typeof connectDB === 'function') {
            await connectDB();
            console.log('Connected to MongoDB via connectDB()');
        } else if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB via mongoose.connect');
        } else {
            console.warn('No DB connection configured (no connectDB and no MONGODB_URI)');
        }

        const server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
        });

        // Socket.io initialization
        const io = require("socket.io")(server, {
            pingTimeout: 60000,
            cors: {
                origin: "http://localhost:3000",
                // methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log("Connected to socket.io");

            socket.on("setup", (userData) => {
                const userId = String(userData._id);
                socket.join(userId);
                console.log("User joined his own room: ", userId);
                socket.emit("connected");
            });

            socket.on("join chat", (room) => {
                socket.join(String(room));
                console.log("User Joined Room: " + room);
            });

            socket.on("typing", (room) => socket.in(String(room)).emit("typing"));
            socket.on("stop typing", (room) => socket.in(String(room)).emit("stop typing"));

            socket.on("new message", (newMessageReceived) => {
                var chat = newMessageReceived.chat;

                if (!chat.users) return console.log("chat.users not defined");

                chat.users.forEach((user) => {
                    if (String(user._id) == String(newMessageReceived.sender._id)) return;

                    socket.in(String(user._id)).emit("message received", newMessageReceived);
                });
            });

            socket.off("setup", () => {
                console.log("USER DISCONNECTED");
                socket.leave(userData._id);
            });
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Export app for testing
module.exports = app;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
