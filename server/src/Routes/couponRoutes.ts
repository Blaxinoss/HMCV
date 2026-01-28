import express from 'express';
import { db } from '../models/index.js';
import type { ICoupon } from '../models/Coupons.js';
import { isValid } from 'date-fns';

const router = express.Router();

// ---------------------------------------------------
// GET: Get All Coupons
// ---------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const { Coupon } = db(req);
        // بنرتبهم الأحدث فالأقدم
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ data: coupons });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ---------------------------------------------------
// POST: Create New Coupon
// ---------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { Coupon } = db(req);

        const { code, discountType, value, expiryDate, usageLimit } = req.body;

        // التأكد إن الكود مش موجود قبل كده
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            value,
            expiryDate,
            usageLimit: usageLimit || 10
        });

        await newCoupon.save();
        res.status(201).json(newCoupon);

    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon' });
    }
});

// ---------------------------------------------------
// DELETE: Delete Coupon
// ---------------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const { Coupon } = db(req);

        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon' });
    }
});

// ---------------------------------------------------
// POST: Validate Coupon (عشان لما ييجي يستخدمه)
// ---------------------------------------------------

router.post('/validate-coupon', async (req, res) => {
    try {

        const { Coupon } = db(req);

        const { code } = req.body;

        if (!code) {
            res.status(400).json({ success: false, message: "Coupon code is required" });
            return;
        }

        // 1. البحث عن الكوبون
        const coupon: ICoupon | null = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        // 2. التحقق من وجوده
        if (!coupon) {
            res.status(404).json({ success: false, message: "Invalid Coupon Code" });
            return;
        }

        // 3. التحقق من التاريخ
        if (new Date() > coupon.expiryDate) {
            res.status(400).json({ success: false, message: "Coupon Expired" });
            return;
        }

        // 4. التحقق من الحد الأقصى للاستخدام
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            res.status(400).json({ success: false, message: "Coupon Usage Limit Reached " });
            return;
        }

        // 5. إرجاع بيانات الخصم
        res.status(200).json({
            success: true,
            message: "Coupon Applied",
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                value: coupon.value,
                isValid: true
            }
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router;