import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { Application } from 'express';
import { RedisStore } from 'rate-limit-redis';
import { redis } from './src/config/redis';
import hpp from 'hpp';
import compression from 'compression';

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Security middleware
export function applySecurityMiddleware(app: Application) {
  // Set secure HTTP headers with strict CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'same-origin' },
    frameguard: { action: 'deny' },
  }));

  // Enable CORS with options
  app.use(cors(corsOptions));
  
  // Handle preflight requests
  app.options('*', cors(corsOptions));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Prevent NoSQL injection
  app.use(mongoSanitize());

  // Enable response compression
  app.use(compression({
    level: 6, // Compression level (0-9)
    threshold: '1kb', // Only compress responses larger than 1KB
  }));

  // Security headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Disable caching for sensitive routes
    if (req.path.startsWith('/api/auth')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    
    next();
  });
}

// Helper function to create a new RedisStore instance with a unique prefix
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: { error: string };
  prefix: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
    // Create a new RedisStore instance for each limiter with a unique prefix
    store: new RedisStore({
      // @ts-expect-error - The Redis client type is not perfectly compatible, but this works
      sendCommand: (...args: string[]) => {
        const command = args[0];
        const commandArgs = args.slice(1);
        return redis.call(command, ...commandArgs);
      },
      prefix: `rate-limit:${options.prefix}:`,
    }),
  });
};

// Global rate limiter (protects all endpoints)
export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  prefix: 'global',
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/register attempts per windowMs
  message: { error: 'Too many authentication attempts. Please try again later.' },
  prefix: 'auth',
});

// Rate limiter for public API endpoints
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many API requests. Please try again later.' },
  prefix: 'api',
});
