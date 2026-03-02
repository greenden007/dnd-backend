import { applySecurityMiddleware, globalLimiter } from '../security';
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

applySecurityMiddleware(app);
app.use(globalLimiter);
app.use(express.json());

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err: any) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit with failure on connection error
    });

// Import routes
import authRoutes from '../routes/auth';
import functionalityRoutes from '../routes/functionality';
import passwordResetRoutes from '../routes/passwordReset';
import { specs, swaggerUi } from './swagger';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/func', functionalityRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
