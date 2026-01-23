
import type { Request, Response } from 'express'
import { Router } from 'express';
import Trainees from '../models/Trainees.js';
import axios from 'axios';
import Coupon, { type ICoupon } from '../models/Coupons.js';


const router = Router();


import { getTargets, sendToN8N } from '../utils/targets.js';

// 1. زرار "Run Expiring Reminders Now" في الداشبورد
router.post('/trigger-reminders', async (req, res) => {
    const { type } = req.body;
    try {
        const targets = await getTargets(type);

        // نبعت لـ Webhook مخصص للنوع ده
        const webhook = process.env.N8N_CAMPAIGN_WEBHOOK;
        if (!webhook) {
            res.status(404).json({ success: false, message: "couldn't load the N8N webhook from the env files" })
            return
        }
        await sendToN8N(targets, webhook);

        res.json({ success: true, count: targets.length, message: "Campaign triggered manually" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});



// router.post('/send-offer', async (req: Request, res: Response): Promise<void> => {
//     const { filterType, messageBody } = req.body;
//     let query = {};


//     if (filterType === 'inactive_30_days') {

//     } else if (filterType === 'all') {
//         query = {};
//     }


//     const targets = await Trainees.find(query).select('name phone _id');

//     try {
//         await axios.post(process.env.N8N_CAMPAIGN_WEBHOOK || "e", {
//             targets: targets, // مصفوفة فيها كل الناس
//             message: messageBody // نص الرسالة اللي الأدمن كتبه
//         });

//         res.json({ success: true, count: targets.length });
//     } catch (e) {
//         // error handling
//     }
// });


router.post("/log/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { messageType } = req.body; // n8n sends: 'expiring', 'debt', 'welcome', etc.

        // تحديث سجل التواصل
        await Trainees.findByIdAndUpdate(id, {
            $set: {
                'crmInfo.lastMessageSent': new Date(), // سجلنا تاريخ اللحظة دي
                'crmInfo.lastMessageType': messageType || 'general'
            }
        });

        res.status(200).json({ success: true, message: "Communication logged" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});





router.post('/validate-coupon', async (req: Request, res: Response): Promise<void> => {
    try {
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
                value: coupon.value
            }
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router