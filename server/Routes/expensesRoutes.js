const express = require('express');
const Expense = require('../models/Expense'); // Ensure the model file path is correct
const router = express.Router();

// Get All Expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Expense
router.post('/', async (req, res) => {
    const expense = new Expense({
        name: req.body.name,
        category: req.body.category,
        amount: req.body.amount,
        dateOfPayment: req.body.dateOfPayment,
    });

    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Edit Expense
router.put('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        expense.name = req.body.name || expense.name;
        expense.category = req.body.category || expense.category;
        expense.amount = req.body.amount || expense.amount;
        expense.dateOfPayment = req.body.dateOfPayment || expense.dateOfPayment;

        const updatedExpense = await expense.save();
        res.json(updatedExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Expense
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
