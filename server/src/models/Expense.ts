import mongoose, { Schema, Document, Model } from 'mongoose';

// Define Expense Interface
export interface IExpense extends Document {
    name: string;
    category: 'Salary' | 'Fixing' | 'Bills' | 'Place Expenses';
    amount: number;
    dateOfPayment: Date;
    createdAt: Date;
}

// Define Expense Schema
const expenseSchema = new Schema<IExpense>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ['Salary', 'Fixing', 'Bills', 'Place Expenses'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        dateOfPayment: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Export Expense model
const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
