import { DiscountType, type ICoupon } from '../models/Coupons.js';
import type mongoose from 'mongoose';
import type { Model } from 'mongoose';

export interface RedeemedCoupon {
    coupon: ICoupon;
    discountAmount: number;
    appliedDiscount: {
        hasCustomDiscount: true;
        discountValue: number;
        discountType: 'fixed' | 'percentage';
    };
}

export function calculateCouponDiscount(
    discountType: DiscountType,
    value: number,
    totalCost: number,
): number {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error('Coupon value must be non-negative');
    }
    if (!Number.isFinite(totalCost) || totalCost < 0) {
        throw new Error('totalCost must be a non-negative finite number');
    }

    return discountType === DiscountType.PERCENTAGE
        ? Math.min(totalCost, (totalCost * value) / 100)
        : Math.min(totalCost, value);
}

export async function redeemCoupon(
    couponModel: Model<ICoupon>,
    code: unknown,
    totalCost: number,
    session?: mongoose.ClientSession,
): Promise<RedeemedCoupon | null> {
    if (typeof code !== 'string' || code.trim() === '') return null;
    if (!Number.isFinite(totalCost) || totalCost < 0) {
        throw new Error('totalCost must be a non-negative finite number');
    }

    const coupon = await couponModel.findOneAndUpdate(
        {
            code: code.trim().toUpperCase(),
            isActive: true,
            expiryDate: { $gte: new Date() },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
            ],
        },
        { $inc: { usedCount: 1 } },
        { new: true, session },
    );

    if (!coupon) return null;
    const discountAmount = calculateCouponDiscount(coupon.discountType, coupon.value, totalCost);

    return {
        coupon,
        discountAmount,
        appliedDiscount: {
            hasCustomDiscount: true,
            discountValue: coupon.value,
            discountType: coupon.discountType === DiscountType.PERCENTAGE ? 'percentage' : 'fixed',
        },
    };
}
