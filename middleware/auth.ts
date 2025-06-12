const jwt = require('jsonwebtoken');
import User from '../models/User';
require('dotenv').config();

module.exports = async function (req: any, res: any, next: any) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if this token contains the active session ID
        const user = await User.findById(decoded.id);

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
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
