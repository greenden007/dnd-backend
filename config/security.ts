import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';

export const configureSecurity = (app: Express) => {
    // Set security HTTP headers
    app.use(helmet());

    // Enable CORS with specific options
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    // Limit requests from same API (rate limiting)
    const limiter = rateLimit({
        max: 100, // limit each IP to 100 requests per windowMs
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: 'Too many requests from this IP, please try again after 15 minutes'
    });
    app.use('/api', limiter);

    // Body parser, reading data from body into req.body
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Prevent parameter pollution
    app.use(hpp({
        whitelist: [
            // Add any query parameters that should be allowed to be duplicated
        ]
    }));

    // Security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none'");
        next();
    });
};
