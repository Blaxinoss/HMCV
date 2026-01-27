import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express, { Router } from 'express';
import verifyToken from '../../midware/verifyToken.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';
import { requireAdmin } from '../../midware/requireAdmin.js';

const router: Router = express.Router();

// // POST /api/auth/register// POST /api/auth/register
// router.post('/register', async (req: Request, res: Response): Promise<void> => {
//     try {
//         // 1. Destructure role from body
//         const { username, password } = req.body;

//         if (!username || !password) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Username and password are required.',
//             });
//             return;
//         }

//         const existingUser = await User.findOne({ username });
//         if (existingUser) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Username already exists.',
//             });
//             return;
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 2. Create User with the Role (Default to 'user' if not sent)
//         const user = new User({
//             username,
//             password: hashedPassword,
//             role: 'user'
//         });

//         await user.save();

//         // 3. Generate Token Immediately (Fixing the Thunk logic)
//         if (!process.env.JWT_SECRET) {
//             throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
//         }

//         const token = jwt.sign(
//             { id: user._id.toString(), username: user.username, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         res.status(201).json({
//             success: true,
//             message: 'User registered successfully.',
//             token, // Send token back
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 role: user.role // Send role back
//             },
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Internal Server Error',
//         });
//     }
// });
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


router.post('/create-admin', verifyToken, requireAdmin, async (req: Request, res: Response) => {
    // هذا الكود لن يصل إليه إلا من معه Token و دوره Admin
    const { username, password } = req.body;

    // ... validation ...
    if (!username || !password) {
        res.status(400).json({
            success: false,
            message: 'Username and password are required.',
        });
        return;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        res.status(400).json({
            success: false,
            message: 'Username already exists.',
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
        username,
        password: hashedPassword,
        role: 'admin' // هنا آمن لأن فقط الأدمن هو من ينشئ أدمن آخر
    });

    await newAdmin.save();
    res.status(201).json({
        success: true,
        message: "New admin created successfully",
        data: {
            _id: newAdmin._id,
            username: newAdmin.username,
            role: newAdmin.role,
            createdAt: newAdmin.createdAt,
            updatedAt: newAdmin.updatedAt
        }
    });

});

router.put('/:userId', verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { username, password } = req.body;

        // 1. Validation: Ensure ID format is valid (Prevent server crash)

        // 2. Find the user
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found.',
            });
            return;
        }

        // --- Logic for Username Update ---
        if (username && username !== user.username) {
            // Check if the NEW username is already taken by SOMEONE ELSE
            const duplicateUser = await User.findOne({ username });
            if (duplicateUser) {
                res.status(400).json({
                    success: false,
                    message: 'Username is already taken.',
                });
                return;
            }
            user.username = username;
        }

        // --- Logic for Password Update ---
        if (password) {
            // Only hash and update if a password value is actually provided
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // 3. Save updates
        const updatedUser = await user.save();

        // 4. Send response (Exclude password)
        res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            data: {
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while updating user.',
        });
    }
});

router.delete('/deleteUser/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'id is required to perform this operation.',
            });
            return;
        }

        // Find user
        const user = await User.findOneAndDelete({ _id: id });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found to delete',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `${user.role === "admin" ? "admin" : "user"} deleted successfully`
        })
    } catch (error: any) {
        // لو حصل أي خطأ في السيرفر
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error during deletion.',
        });
    }


})

export default router;
