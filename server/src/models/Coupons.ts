import mongoose, { Schema, Document } from 'mongoose';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED'
}

export interface ICoupon extends Document {
    code: string;
    discountType: DiscountType;
    value: number;
    expiryDate: Date;
    isActive: boolean;
    usageLimit: number | null;
    usedCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: Object.values(DiscountType),
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);