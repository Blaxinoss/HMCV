import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';

// Extend Express Request to include user
export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}

const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided. Access denied.',
            });
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
        }

        // Verify token
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret) as { id: string; username: string, role: string };

        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            res.status(401).json({ message: 'User no longer exists' });
            return;
        }

        req.user = {
            id: freshUser._id.toString(),
            username: freshUser.username,
            role: freshUser.role
        };
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.',
            });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(403).json({
                success: false,
                message: 'Invalid token. Access denied.',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Token verification failed.',
            });
        }
    }
};

export default verifyToken;
