import express from "express"
import type { Request, Response } from 'express';
import Trainees from '../models/Trainees.js'; // Import Model and Interface
import type { ITrainee } from "../models/Trainees.js"
import axios from "axios"
import mongoose, { Mongoose } from "mongoose";
const router = express.Router();
import Coupon from '../models/Coupons.js';
import { type ICoupon, DiscountType } from '../models/Coupons.js'
// GET: Fetch all trainees
router.get('/', async (req: Request, res: Response) => {
    try {
        const trainees = await Trainees.find();
        res.status(200).json({ success: true, data: trainees }); // Standard is 200 for GET, 201 is usually for Create
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST: Create a new trainee
router.post('/', async (req: Request, res: Response) => {
    try {

        const lastTrainee = await Trainees.findOne({
            memberId: { $exists: true }
        }).sort({ memberId: -1 })

        const newMemberId = lastTrainee && lastTrainee.memberId ? lastTrainee.memberId + 1 : 1;


        // 1. Destructure only allowed fields
        const {
            name,
            phone,
            subscriptionStartDate,
            subscriptionEndDate,
            totalCost,
            isSession,
            sessionsCount,
            paid,
            couponCode
        } = req.body;

        let discountAmount = 0;
        let finalUsedCouponCode = null;

        if (couponCode) {
            const coupon: ICoupon | null = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true
            });

            if (coupon) {
                const isExpired = new Date() > coupon.expiryDate;
                const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

                if (!isExpired && !isLimitReached) {
                    // حساب قيمة الخصم
                    if (coupon.discountType === DiscountType.PERCENTAGE) {
                        discountAmount = (totalCost * coupon.value) / 100;
                    } else if (coupon.discountType === DiscountType.FIXED) {
                        discountAmount = coupon.value;
                    }

                    // تحديث بيانات الكوبون
                    coupon.usedCount += 1;
                    await coupon.save();

                    finalUsedCouponCode = coupon.code;
                }
            }
        }


        if (isSession && !sessionsCount) {
            res.status(400).json({ success: false, message: "Sessions is checked but no session count is provided" })
            return;
        }

        const remainingAmount = (totalCost - discountAmount) - paid;

        const newTrainee = new Trainees({
            memberId: newMemberId,
            name,
            phone,
            subscriptionStartDate,
            subscriptionEndDate,
            totalCost,
            isSession,
            sessionsRemaining: isSession ? sessionsCount : 0,
            discount: discountAmount,
            paid,
            remaining: remainingAmount,
            usedCoupon: finalUsedCouponCode
        });

        const savedTrainee = await newTrainee.save();

        const N8N_WEBHOOK_URL = process.env.N8N_WELCOME_WEBHOOK || 'http://localhost:5678/webhook-test/welcome_user';


        try {
            await axios.post(N8N_WEBHOOK_URL, {
                id: savedTrainee._id,
                name: savedTrainee.name,
                phone: savedTrainee.phone,
                memberId: savedTrainee.memberId,
            }, {
                headers: {
                    "key": process.env.N8N_API_SECRET
                }
            })
            console.log(`Successfully triggered n8n for client: ${savedTrainee.name} message has been sent`);
        } catch (n8nError: any) {
            console.error('Failed to trigger n8n webhook:', n8nError.message);
        }


        res.status(201).json({ success: true, data: savedTrainee });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})


router.put('/:id/freeze', async (req: Request, res: Response): Promise<void> => {
    try {
        const trainee = await Trainees.findById(req.params.id);

        if (!trainee) {
            res.status(404).json({ error: 'Trainee not found' });
            return;
        }

        const currentDate = new Date();

        // -------------------------------------------------------
        //(Unfreeze)
        // -------------------------------------------------------
        if (trainee.accountFreezeStatus) {
            if (trainee.freezeStartDate) {
                const start = new Date(trainee.freezeStartDate).getTime();
                const current = currentDate.getTime();

                const freezeDurationMs = current - start;

                if (freezeDurationMs > 0) {
                    const currentEndDate = new Date(trainee.subscriptionEndDate).getTime();
                    trainee.subscriptionEndDate = new Date(currentEndDate + freezeDurationMs);
                    console.log(`Unfreezing: Added ${freezeDurationMs / (1000 * 60 * 60 * 24)} days`);
                }
            }

            trainee.freezeStartDate = null;
            trainee.accountFreezeStatus = false;

            // -------------------------------------------------------
            // (Freeze)
            // -------------------------------------------------------
        } else {
            if (new Date(trainee.subscriptionEndDate) < currentDate) {
                res.status(400).json({ error: 'Cannot freeze an expired subscription' });
                return;
            }

            trainee.accountFreezeStatus = true;
            trainee.freezeStartDate = currentDate;
        }

        const updatedTrainee = await trainee.save();

        res.status(200).json({
            _id: updatedTrainee._id,
            accountFreezeStatus: updatedTrainee.accountFreezeStatus,
            subscriptionEndDate: updatedTrainee.subscriptionEndDate,
            freezeStartDate: updatedTrainee.freezeStartDate,
            message: updatedTrainee.accountFreezeStatus ? "Account Frozen" : "Account Unfrozen"
        });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/check-in/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1. Validation ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(404).json({ error: "Invalid User ID format" });
    }
    const trainee = await Trainees.findById(id);


    if (!trainee) {
        return res.status(404).json({ error: "User not found in database" });
    }


    if (trainee.accountFreezeStatus) {
        return res.status(400).json({ error: "Account is Frozen " });
    }

    const today = new Date();
    if (trainee.lastAttendance) {
        const lastDate = new Date(trainee.lastAttendance).toDateString(); // "Mon Jan 20 2026"
        const todayDate = today.toDateString(); // "Mon Jan 20 2026"

        if (lastDate === todayDate) {
            return res.status(400).json({ error: "Already checked in today!" });
        }
    }

    let warnings = [];

    // ---------------------------------------------------------
    // Session Case
    // -----------------------------------------------------
    if (trainee.isSession) {



        if (trainee.sessionsRemaining <= 0) {
            return res.status(400).json({
                error: "No sessions left! Please renew. 🎟️",
                remaining: 0
            });
        }

        trainee.sessionsRemaining -= 1;

        if (trainee.subscriptionEndDate && new Date(trainee.subscriptionEndDate) < today) {
            warnings.push("Session Pack Expired (Date)");
        }


    } else {
        // ---------------------------------------------------------
        // Normal CASE
        // -----------------------------------------------------
        if (trainee.subscriptionEndDate && new Date(trainee.subscriptionEndDate) < today) {
            warnings.push("Subscription Expired 📅");
        }
    }


    if (trainee.remaining > 0) {
        warnings.push(`Has Debt: ${trainee.remaining}`);
    }

    trainee.lastAttendance = today;
    trainee.attendanceHistory.push({ checkIn: today });
    await trainee.save();

    return res.status(200).json({
        success: true,
        message: trainee.isSession
            ? `Checked in! Sessions left: ${trainee.sessionsRemaining}`
            : "User checked in successfully",
        alerts: warnings.length > 0 ? warnings : null,
        data: {
            sessionsRemaining: trainee.sessionsRemaining,
            lastAttendance: trainee.lastAttendance
        }
    });
});

// GET: Fetch single trainee
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const trainee = await Trainees.findById(req.params.id);
        if (!trainee) {
            res.status(404).json({ error: 'Trainee not found' });
            return;
        }
        res.status(200).json({ success: true, data: trainee });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Remove trainee
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedTrainee = await Trainees.findByIdAndDelete(req.params.id);
        if (!deletedTrainee) {
            res.status(404).json({ error: 'Trainee not found' });
            return;
        }
        res.status(200).json({ message: 'Trainee deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Update trainee details
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const trainee = await Trainees.findById(req.params.id);

        if (!trainee) {
            return res.status(404).json({ error: 'Trainee not found' });
        }

        const {
            name,
            phone,
            subscriptionStartDate,
            totalCost,
            paid
            // لاحظ: مكتبناش remaining ولا role ولا memberId
        } = req.body;

        // تحديث الحقول لو كانت مبعوتة (عشان متمسحش القديم بـ undefined)
        if (name) trainee.name = name;
        if (phone) trainee.phone = phone;
        if (subscriptionStartDate) trainee.subscriptionStartDate = subscriptionStartDate;

        // لو عدل الفلوس، الـ Pre-save Hook هيشتغل ويظبط الـ remaining
        if (totalCost !== undefined) trainee.totalCost = totalCost;
        if (paid !== undefined) trainee.paid = paid;

        // 🔥 السطر ده هو اللي بيشغل الـ Hook ويحسب الـ Remaining
        const updatedTrainee = await trainee.save();

        res.status(200).json(updatedTrainee);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST: /api/trainees/:id/renew
router.post('/:id/renew', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            durationInDays, // مدة التجديد (30 يوم مثلاً)
            totalCost,      // سعر الباقة الجديد
            paid,           // المبلغ المدفوع الآن
            couponCode,      // الكوبون (اختياري)
            sessionsCount
        } = req.body;

        const trainee = await Trainees.findById(id);

        if (!trainee) {
            res.status(404).json({ error: "Trainee not found" });
            return;
        }

        if (trainee.remaining > 0) {
            res.status(400).json({
                success: false,
                error: `Cannot renew. Trainee has an outstanding debt of ${trainee.remaining} EGP. Please clear debt first.`
            });
            return;
        }


        // 1. منطق التواريخ (Date Logic)
        const today = new Date();
        let newStartDate = today;
        let currentEndDate = new Date(trainee.subscriptionEndDate);

        // لو اشتراكه لسه ساري، ابدأ التجديد من بعد ما يخلص
        if (currentEndDate > today) {
            newStartDate = currentEndDate;
        }
        // لو منتهي، ابدأ من النهاردة (newStartDate already = today)

        // حساب تاريخ الانتهاء الجديد
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + durationInDays);


        // 2. منطق الكوبون (نفس الكود نعيده هنا)
        let discountAmount = 0;
        let finalUsedCouponCode = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true
            });

            if (coupon) {
                const isExpired = new Date() > coupon.expiryDate;
                const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

                if (!isExpired && !isLimitReached) {
                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = (totalCost * coupon.value) / 100;
                    } else if (coupon.discountType === 'FIXED') {
                        discountAmount = coupon.value;
                    }

                    // تحديث الكوبون
                    coupon.usedCount += 1;
                    await coupon.save();
                    finalUsedCouponCode = coupon.code;
                }
            }
        }

        // 3. تحديث بيانات العميل
        // خلي بالك: احنا بنصفر الديون القديمة وبنبدأ حساب جديد للشهر ده
        // أو ممكن تجمع الديون القديمة لو حابب (Business Decision)
        // هنا هنفترض إن التجديد عملية جديدة منفصلة

        const remainingAmount = (totalCost - discountAmount) - paid;

        trainee.subscriptionStartDate = newStartDate;
        trainee.subscriptionEndDate = newEndDate;
        trainee.totalCost = totalCost;
        trainee.discount = discountAmount;
        trainee.paid = paid;
        trainee.remaining = remainingAmount; // تحديث المتبقي
        trainee.usedCoupon = finalUsedCouponCode || trainee.usedCoupon; // سجل الكوبون الجديد


        if (trainee.isSession) {
            if (!sessionsCount) {
                res.status(400).json({ error: "Please provide sessionsCount for session-based renewal" });
                return;
            }
            // بنضيف الحصص الجديدة على القديمة (أو ممكن تخليه يساوي الجديدة بس حسب سياستك)
            // غالباً في التجديد بنصفر القديم ونبدأ باقة جديدة، أو بنزود عليها.
            // هنا هنفترض إنها باقة جديدة:
            trainee.sessionsRemaining = sessionsCount;

            // لو عايز تراكمي: trainee.sessionsRemaining += sessionsCount;
        }


        // فك التجميد لو كان مجمد
        trainee.accountFreezeStatus = false;
        trainee.freezeStartDate = null;

        await trainee.save();

        res.status(200).json({
            success: true,
            message: "Subscription Renewed Successfully",
            data: trainee
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



export default router;