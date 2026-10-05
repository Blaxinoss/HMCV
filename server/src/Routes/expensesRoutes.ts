import express, { Router } from 'express';
import verifyToken from '../../midware/verifyToken.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';
import { db } from '../models/index.js';
import { validateExpenseInput } from '../utils/validation.js';
import mongoose from 'mongoose';
import { recordAudit } from '../services/auditService.js';
const router: Router = express.Router();

// Apply JWT verification to all routes
router.use(verifyToken);

// GET All Expenses
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Expense } = db(req);
        const expenses = await Expense.find({ deleteFlag: false }).sort({ dateOfPayment: -1 });
        res.status(200).json({
            success: true,
            data: expenses,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST Add Expense
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Expense } = db(req);

        const { name, category, amount, dateOfPayment, description } = req.body;

        const validationErrors = validateExpenseInput(
            { name, category, amount, dateOfPayment, description },
            'create',
        );
        if (validationErrors.length > 0) {
            res.status(400).json({
                success: false,
                message: validationErrors.join('; '),
            });
            return;
        }

        const expense = new Expense({
            name,
            category,
            amount,
            dateOfPayment,
            description: description || ""
        });

        const newExpense = await expense.save();
        res.status(201).json({
            success: true,
            message: 'Expense added successfully.',
            data: newExpense,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT Edit Expense
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Expense } = db(req);
        const validationErrors = validateExpenseInput(req.body, 'update');
        if (validationErrors.length > 0) {
            res.status(400).json({ success: false, message: validationErrors.join('; ') });
            return;
        }

        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            res.status(404).json({
                success: false,
                message: 'Expense not found',
            });
            return;
        }

        if (req.body.name !== undefined) expense.name = req.body.name;
        if (req.body.category !== undefined) expense.category = req.body.category;
        if (req.body.amount !== undefined) expense.amount = req.body.amount;
        if (req.body.dateOfPayment !== undefined) expense.dateOfPayment = req.body.dateOfPayment;
        if (req.body.description !== undefined) expense.description = req.body.description;

        const updatedExpense = await expense.save();
        res.status(200).json({
            success: true,
            message: 'Expense updated successfully.',
            data: updatedExpense,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE Expense
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Expense, AuditLog } = db(req);
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            {
                deleteFlag: true,
                deletedAt: new Date(),
                deletedBy: req.user?.id,
            },
            { new: true },
        );
        if (!expense) {
            res.status(404).json({
                success: false,
                message: 'Expense not found',
            });
            return;
        }

        await recordAudit({
            auditLogModel: AuditLog,
            action: 'expense.deleted',
            entity: 'Expense',
            entityId: String(expense._id),
            actorUserId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
            requestId: req.headers['x-request-id'] as string | undefined,
            after: { deleteFlag: true, deletedAt: expense.deletedAt },
        });

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
