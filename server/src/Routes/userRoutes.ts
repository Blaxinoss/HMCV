import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import express, { Router } from 'express';
import verifyToken from '../../midware/verifyToken.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';
const router: Router = express.Router();

// GET all users (admin only) - Protected route
router.get('/', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT update user - Protected route
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required.',
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(
            id,
            { username, password: hashedPassword },
            { new: true }
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            user: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE user - Protected route
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);


        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        if (user.role === 'admin') {
            res.status(403).json({
                success: false,
                message: 'Admin user cannot be deleted.',
            });
            return;
        }

        await User.deleteOne({ _id: id });


        res.status(200).json({
            success: true,
            message: 'User deleted successfully.',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
