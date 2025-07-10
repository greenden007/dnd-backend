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

// Import routes with proper path resolution
app.use('/api/auth', require(path.join(__dirname, '../routes/auth')));
app.use('/api/func', require(path.join(__dirname, '../routes/functionality')));

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
