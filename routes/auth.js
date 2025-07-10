"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const jwt = require('jsonwebtoken');
const User_1 = __importDefault(require("../models/User"));
const bcrypt = require('bcryptjs');
const Joi = require('joi');
require('dotenv').config();
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
const validateRequest = (schema) => {
    return (req, res, next) => {
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
router.post('/register', validateRequest(registerSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email } = req.body;
        const existingUser1 = yield User_1.default.findOne({ email });
        const existingUser2 = yield User_1.default.findOne({ username });
        if (existingUser1 || existingUser2) {
            return res.status(400).json({ message: 'Email or username already in use' });
        }
        const salt = yield bcrypt.genSalt(10);
        const hashedPassword = yield bcrypt.hash(password, salt);
        // Generate a unique session ID for the new user
        const sessionId = new mongoose_1.default.Types.ObjectId().toString();
        const user = new User_1.default({
            username,
            password: hashedPassword,
            email,
            activeSession: sessionId,
            lastLogin: new Date(),
            isBetaTester: true
        });
        yield user.save();
        // Mark the beta code as used by this user
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            sessionId: sessionId
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '48h' });
        res.status(200).json({ token, id: user._id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post('/login', validateRequest(loginSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield User_1.default.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // Generate a unique session ID
        const sessionId = new mongoose_1.default.Types.ObjectId().toString();
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            sessionId: sessionId
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '48h' });
        // Update user with new session ID (invalidates previous sessions)
        yield User_1.default.findByIdAndUpdate(user._id, {
            activeSession: sessionId,
            lastLogin: new Date()
        });
        res.status(200).json({ token, id: user._id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            // Clear the active session for the user
            yield User_1.default.findByIdAndUpdate(decoded.id, {
                activeSession: null
            });
            res.status(200).json({ message: 'Logged out successfully' });
        }));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.delete('/delete-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Option 1: Use Mongoose's built-in methods directly
        yield User_1.default.findByIdAndDelete(userId);
        // Option 2: If you still want to use your static method but with error handling
        try {
            yield User_1.default.deleteUser(userId);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            throw error; // Re-throw or handle as needed
        }
        res.status(200).json({ message: 'User successfully deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get('/is-logged-in', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({
                    isLoggedIn: false,
                    message: 'Invalid or expired token'
                });
            }
            // Check if the session is still active
            const user = yield User_1.default.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    isLoggedIn: false,
                    message: 'User not found'
                });
            }
            // If the token's session ID doesn't match the active session
            if (user.activeSession !== decoded.sessionId) {
                return res.status(401).json({
                    isLoggedIn: false,
                    message: 'Your session has expired because you logged in from another device'
                });
            }
            // Token is valid and session is active
            return res.status(200).json({
                isLoggedIn: true,
                user: {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email
                }
            });
        }));
    }
    catch (error) {
        return res.status(500).json({
            isLoggedIn: false,
            error: error.message
        });
    }
}));
module.exports = router;
