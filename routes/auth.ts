import { Router } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import dotenv from 'dotenv';
import User, { User as UserType } from '../models/User';
import { authLimiter } from '../security';

dotenv.config();

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
    email: Joi.string().email().required(),
    betaCode: Joi.string().required()
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

// Validation middleware
const validateRequest = (schema: any) => {
    return (req: any, res: any, next: any) => {
        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
                error: true
            });
        }

        next();
    };
};

router.post('/register', authLimiter, validateRequest(registerSchema), async (req: any, res: any) => {
    try {
        const { username, password, email } = req.body;
        const existingUser1 = await User.findOne({ email });
        const existingUser2 = await User.findOne({ username });
        if (existingUser1 || existingUser2) {
            return res.status(400).json({ message: 'Registration failed. Please try again.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a unique session ID for the new user
        const sessionId = new mongoose.Types.ObjectId().toString();

        const user = new User({
            username,
            password: hashedPassword,
            email,
            activeSession: sessionId,
            lastLogin: new Date(),
            isBetaTester: true
        });

        await user.save();

        // Mark the beta code as used by this user

        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            sessionId: sessionId
        };

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const jwtSecret = process.env.JWT_SECRET;

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '48h' });
        res.status(200).json({ token, id: user._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', authLimiter, validateRequest(loginSchema), async (req: any, res: any) => {
    try {
        const { username, password } = req.body;
        const user: any = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate a unique session ID
        const sessionId = new mongoose.Types.ObjectId().toString();

        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            sessionId: sessionId
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const jwtSecret = process.env.JWT_SECRET;

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '48h' });

        // Update user with new session ID (invalidates previous sessions)
        await User.findByIdAndUpdate(user._id, {
            activeSession: sessionId,
            lastLogin: new Date()
        });

        res.status(200).json({ token, id: user._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/logout', async (req: any, res: any) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const jwtSecret = process.env.JWT_SECRET;

        jwt.verify(token, jwtSecret, async (err: any, decoded: any) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            // Clear the active session for the user
            await User.findByIdAndUpdate(decoded.id, {
                activeSession: null
            });

            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/delete-user', async (req: any, res: any) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Option 1: Use Mongoose's built-in methods directly
        await User.findByIdAndDelete(userId);

        // Option 2: If you still want to use your static method but with error handling
        try {
            await (User as any).deleteUser(userId);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error; // Re-throw or handle as needed
        }
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/is-logged-in', async (req: any, res: any) => {
    try {
        // Check for token in various places (header, query params, or body)
        const authHeader = req.headers['authorization'];
        const tokenFromHeader = authHeader ? authHeader.split(' ')[1] : null;
        const tokenFromQuery = req.query.token;
        const tokenFromBody = req.body.token;

        // Use the first available token
        const token = tokenFromHeader || tokenFromQuery || tokenFromBody;

        if (!token) {
            return res.status(401).json({
                isLoggedIn: false,
                message: 'No authentication token provided'
            });
        }

        try {
            // Verify the token
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
            }
            const jwtSecret = process.env.JWT_SECRET;

            // Verify the token
            const decoded = jwt.verify(token, jwtSecret) as { id: string; sessionId: string };

            // Check if the session is still active
            const user = await User.findById(decoded.id);
            if (!user || user.activeSession !== decoded.sessionId) {
                return res.status(401).json({
                    isLoggedIn: false,
                    message: 'Session expired. Please log in again.'
                });
            }

            // Token and session are valid
            res.status(200).json({
                isLoggedIn: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            return res.status(401).json({
                isLoggedIn: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            isLoggedIn: false,
            error: error.message
        });
    }
})

// Export the router as default
export default router;
