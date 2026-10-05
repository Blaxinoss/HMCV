import mongoose, { Document, Schema } from 'mongoose';

export type PaymentTransactionType = 'payment' | 'refund' | 'adjustment';
export type PaymentTransactionStatus = 'posted' | 'voided';

export interface IPaymentTransaction extends Document {
    traineeId: mongoose.Types.ObjectId;
    billingCycleId: string;
    type: PaymentTransactionType;
    amountMinor: number;
    currency: string;
    status: PaymentTransactionStatus;
    reason?: string;
    reference?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
    {
        traineeId: {
            type: Schema.Types.ObjectId,
            ref: 'Trainees',
            required: true,
            index: true,
        },
        billingCycleId: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['payment', 'refund', 'adjustment'],
            required: true,
            index: true,
        },
        amountMinor: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: 'Transaction amount must be an integer in minor currency units',
            },
        },
        currency: {
            type: String,
            required: true,
            default: 'EGP',
            uppercase: true,
            trim: true,
            minlength: 3,
            maxlength: 3,
        },
        status: {
            type: String,
            enum: ['posted', 'voided'],
            default: 'posted',
            required: true,
        },
        reason: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        reference: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true },
);

PaymentTransactionSchema.index({ traineeId: 1, billingCycleId: 1, createdAt: -1 });

export default mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
