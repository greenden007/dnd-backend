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
const jwt = require('jsonwebtoken');
const User_1 = __importDefault(require("../models/User"));
require('dotenv').config();
module.exports = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Check if this token contains the active session ID
            const user = yield User_1.default.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // If the token's session ID doesn't match the active session
            if (user.activeSession !== decoded.sessionId) {
                return res.status(401).json({
                    message: 'Your session has expired because you logged in from another device'
                });
            }
            req.user = decoded;
            next();
        }
        catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    });
};
