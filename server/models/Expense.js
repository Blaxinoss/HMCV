const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ['Salary', 'Fixing', 'Bills', 'Place Expenses'],
        required: true
    },
    amount: { type: Number, required: true },
    dateOfPayment: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
