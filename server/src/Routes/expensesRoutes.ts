import express, { Router } from 'express';
import Expense from '../models/Expense.js';
import verifyToken from '../../midware/verifyToken.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';
const router: Router = express.Router();

// Apply JWT verification to all routes
router.use(verifyToken);

// GET All Expenses
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const expenses = await Expense.find().sort({ dateOfPayment: -1 });
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
        const { name, category, amount, dateOfPayment } = req.body;

        // Validate input
        if (!name || !category || !amount || !dateOfPayment) {
            res.status(400).json({
                success: false,
                message: 'All fields are required.',
            });
            return;
        }

        const expense = new Expense({
            name,
            category,
            amount,
            dateOfPayment,
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
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            res.status(404).json({
                success: false,
                message: 'Expense not found',
            });
            return;
        }

        expense.name = req.body.name || expense.name;
        expense.category = req.body.category || expense.category;
        expense.amount = req.body.amount || expense.amount;
        expense.dateOfPayment = req.body.dateOfPayment || expense.dateOfPayment;

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
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            res.status(404).json({
                success: false,
                message: 'Expense not found',
            });
            return;
        }

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
