import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import type { User as UserType } from '../models/User';
import 'dotenv/config';

export default async (req: Request, res: Response, next: NextFunction) => {
    // Type for the decoded JWT payload
    interface JwtPayload {
        id: string;
        sessionId: string;
    }
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
    return;
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in the environment variables');
        }
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Check if this token contains the active session ID
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
    return;
        }

        // If the token's session ID doesn't match the active session
        if (user.activeSession && user.activeSession !== decoded.sessionId) {
            res.status(401).json({
                message: 'Your session has expired because you logged in from another device'
            });
            return;
        }

        req.user = user as UserType; // Assign the full user document with correct type
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    return;
    }
}
