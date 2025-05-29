import {Router} from 'express';

const router = Router();
const jwt = require('jsonwebtoken');
import User from '../models/User';
const bcrypt = require('bcryptjs');
const Joi = require('joi');
require('dotenv').config();

// Validation schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
    email: Joi.string().email().required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
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

router.post('/register', validateRequest(registerSchema), async (req: any, res: any) => {
    try {
        const { username, password, email } = req.body;
        const existingUser1 = await User.findOne({ email });
        const existingUser2 = await User.findOne({ username });
        if (existingUser1 || existingUser2) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashedPassword,
            email
        });

        await user.save();

        const payload = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '48h' }, (err: any, token: any) => {
            if (err) throw err;
            res.status(200).json({token, "id": user._id})
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
});

router.post('/login', validateRequest(loginSchema), async (req: any, res: any) => {
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

        const payload = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '48h' }, (err: any, token: any) => {
            if (err) throw err;
            res.status(200).json({token, "id": user._id});
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
});

router.post('/logout', async (req: any, res: any) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err: any) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error: any) {
        res.status(500).json({error: error.message});
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
        res.status(500).json({error: error.message});
    }
})

module.exports = router;
