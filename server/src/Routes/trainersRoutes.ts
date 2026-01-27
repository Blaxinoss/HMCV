import express, { Router } from 'express';
import verifyToken from '../../midware/verifyToken.js';
import type { Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';
import { db } from '../models/index.js';

const router: Router = express.Router();

// Apply JWT verification to all routes
router.use(verifyToken);

// GET all trainers
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Trainers } = db(req);

        const result = await Trainers.find({ deleteFlag: false }).sort({ name: 1 });
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST create trainer
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Trainers } = db(req);

        const { name, phone, salary, raise } = req.body;

        // Validate input
        if (!name || !phone || !salary) {
            res.status(400).json({
                success: false,
                message: 'Name, phone, and salary are required.',
            });
            return;
        }

        const trainer = new Trainers({
            name,
            phone,
            salary,
            raise: raise || 0,
        });

        const savedTrainer = await trainer.save();
        res.status(201).json({
            success: true,
            message: 'Trainer created successfully.',
            data: savedTrainer,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT update trainer
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Trainers } = db(req);

        const updatedTrainer = await Trainers.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTrainer) {
            res.status(404).json({
                success: false,
                message: 'Trainer not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Trainer updated successfully.',
            data: updatedTrainer,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE trainer (soft delete with deleteFlag)
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Trainers } = db(req);

        const trainerToDelete = await Trainers.findByIdAndUpdate(
            req.params.id,
            { deleteFlag: true },
            { new: true }
        );

        if (!trainerToDelete) {
            res.status(404).json({
                success: false,
                message: 'Trainer not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Trainer deleted successfully.',
            data: trainerToDelete,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
