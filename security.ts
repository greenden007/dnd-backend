import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { Application } from 'express';

export function applySecurityMiddleware(app: Application) {
    // Set secure HTTP headers
    app.use(helmet());

    // Prevent NoSQL injection
    app.use(mongoSanitize());

    // CORS - restrict as needed
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*', // Change to your frontend domain in production
        credentials: true
    }));
}

// Global rate limiter (protects all endpoints)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.'
});

// Auth-specific rate limiter (protects login/register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login/register attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts. Please try again later.'
});
