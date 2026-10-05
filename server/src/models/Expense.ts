import mongoose, { Schema, Document, Model } from 'mongoose';

// Define Expense Interface
export interface IExpense extends Document {
    name: string;
    category: 'Bills' | 'Rent' | 'Utilities' |
    'Equipment' |
    'Marketing' |
    'Salaries' |
    'Maintenance' |
    'Insurance' |
    'Supplies' |
    'Other';
    amount: number;
    dateOfPayment: Date;
    deleteFlag: boolean;
    deletedAt?: Date | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    createdAt: Date;
    description?: String;
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
            enum: ['Bills', 'Rent', 'Utilities',
                'Equipment',
                'Marketing',
                'Salaries',
                'Maintenance',
                'Insurance',
                'Supplies',
                'Other'],
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
        deleteFlag: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        description: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

// Export Expense model
// const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

// export default Expense;

export { expenseSchema }