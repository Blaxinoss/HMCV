import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express, { Router } from 'express';
import verifyToken from '../../midware/verifyToken.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';

const router: Router = express.Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required.',
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Username already exists.',
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required.',
            });
            return;
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
            return;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(
            { id: user._id.toString(), username: user.username, role: user.role },
            secret,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
});

export default router;
