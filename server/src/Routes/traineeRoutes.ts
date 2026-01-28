import express from "express"
import type { Request, Response } from 'express';
import axios from "axios"
import mongoose, { Mongoose } from "mongoose";
const router = express.Router();
import { type ICoupon, DiscountType } from '../models/Coupons.js'
import { db } from '../models/index.js';

// GET: Fetch all trainees
router.get('/', async (req: Request, res: Response) => {
    try {

        const { Trainees } = db(req);


        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search ? (req.query.search as string).trim() : "";
        const status = req.query.status || "all"
        const skip = (page - 1) * limit;

        // 1. بناء جملة البحث (الذكية)
        let query: any = {};

        if (search) {
            const searchConditions = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];

            if (!isNaN(Number(search))) {
                searchConditions.push({ memberId: Number(search) } as any);
            }

            query = { $or: searchConditions };
        }

        const today = new Date();
        if (status === 'active') {
            query.subscriptionEndDate = { $gt: today };
            query.accountFreezeStatus = false;
        } else if (status === 'expired') {
            query.subscriptionEndDate = { $lt: today };
            query.accountFreezeStatus = false;
        } else if (status === 'frozen') {
            query.accountFreezeStatus = true;
        } else if (status === 'debt') {
            query.remaining = { $gt: 0 };
        } else if (status === 'session') {
            query.isSession = true;
        }

        const trainees = await Trainees.find(query)
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const totalSearchBoxResults = await Trainees.countDocuments(query);

        res.status(200).json({
            success: true,
            data: trainees,
            pagination: {
                totalUsers: totalSearchBoxResults,
                totalPages: Math.ceil(totalSearchBoxResults / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST: Create a new trainee
router.post('/', async (req: Request, res: Response) => {
    try {
        const { Trainees, Coupon } = db(req);

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
            couponCode,
            program,
        } = req.body;

        let discountAmount = 0;
        let finalUsedCouponCode = null;
        const appliedDiscountData = {
            hasCustomDiscount: false, // لو فيه خصم يبقا true
            discountValue: 0,
            discountType: "fixed"
        };

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
                        appliedDiscountData.discountType = 'percentage';
                    } else if (coupon.discountType === DiscountType.FIXED) {
                        discountAmount = coupon.value;
                        appliedDiscountData.discountType = 'fixed';
                    }

                    // تحديث بيانات الكوبون
                    coupon.usedCount += 1;

                    await coupon.save();

                    finalUsedCouponCode = coupon.code;
                    appliedDiscountData.hasCustomDiscount = true
                    appliedDiscountData.discountValue = coupon.value;
                }
            }
        }


        if (isSession && !sessionsCount) {
            res.status(400).json({ success: false, message: "Sessions is checked but no session count is provided" })
            return;
        }



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
            program,
            usedCoupon: finalUsedCouponCode,
            appliedDiscount: appliedDiscountData,
        });

        const savedTrainee = await newTrainee.save();

        const N8N_WEBHOOK_URL = process.env.N8N_WELCOME_WEBHOOK || 'http://localhost:5678/webhook-test/welcome_user';
        const N8N_API_SECRET = process.env.N8N_API_SECRET

        if (!N8N_API_SECRET) {
            console.log('couldn\'t find N8N api secret in ur env')
        }


        try {
            await axios.post(N8N_WEBHOOK_URL, {
                id: savedTrainee._id,
                name: savedTrainee.name,
                phone: savedTrainee.phone,
                memberId: savedTrainee.memberId,
            }, {
                headers: {
                    "key": N8N_API_SECRET
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
        const { Trainees } = db(req);

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
            if (trainee.freezeStartDate && trainee.daysLeft) {
                const start = new Date(trainee.freezeStartDate)//  21/10/2022 at 10 pm 
                start.setHours(0, 0, 0, 0);

                const current = new Date(currentDate)//  23/10/2022 at 5 pm
                current.setHours(0, 0, 0, 0);
                const freezeDurationMs = current.getTime() - start.getTime();

                if (freezeDurationMs > 0) {
                    const currentEndDate = new Date(trainee.subscriptionEndDate).getTime();
                    trainee.subscriptionEndDate = new Date(currentEndDate + freezeDurationMs);
                    // trainee.daysLeft += Math.ceil(freezeDurationMs / (1000 * 60 * 60 * 24)) // okay getting the freezing duration

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

            if (trainee.remaining > 0) {
                res.status(400).json({
                    error: `Cannot freeze account with outstanding debt (${trainee.remaining} EGP). Please clear debt first.`
                });
                return;
            }

            let freezeStart = new Date(currentDate);
            freezeStart.setHours(0, 0, 0, 0);

            if (trainee.lastAttendance) {
                const lastAtt = new Date(trainee.lastAttendance);
                lastAtt.setHours(0, 0, 0, 0);


                if (lastAtt.getTime() === freezeStart.getTime()) {
                    console.log("User attended today. Freeze starts TOMORROW");

                    // زحزح بداية التجميد ليوم بكرة
                    freezeStart.setDate(freezeStart.getDate() + 1);
                }
            }

            trainee.accountFreezeStatus = true;
            trainee.freezeStartDate = freezeStart;
        }

        const updatedTrainee = await trainee.save();

        res.status(200).json({
            success: true,
            message: updatedTrainee.accountFreezeStatus ? "Account Frozen" : "Account Unfrozen",
            data: {
                _id: updatedTrainee._id,
                accountFreezeStatus: updatedTrainee.accountFreezeStatus,
                subscriptionEndDate: updatedTrainee.subscriptionEndDate,
                freezeStartDate: updatedTrainee.freezeStartDate,
                message: updatedTrainee.accountFreezeStatus ? "Account Frozen" : "Account Unfrozen"
            }
        });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/check-in/:id", async (req: Request, res: Response) => {
    const { Trainees } = db(req);

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
    if (new Date(trainee.subscriptionEndDate) < today) {
        return res.status(400).json({ error: "Cannot check-in: Subscription EXPIRED ⏳" });
    }

    // 3. فحص عدد الحصص (لو مشترك حصص)
    if (trainee.isSession && trainee.sessionsRemaining <= 0) {
        return res.status(400).json({ error: "Cannot check-in: No Sessions Remaining 🎫" });
    }

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
        const { Trainees } = db(req);

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
        const { Trainees } = db(req);

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
        const { Trainees, Coupon } = db(req);
        const { id } = req.params;

        const trainee = await Trainees.findById(id);

        if (!trainee) {
            return res.status(404).json({ error: 'Trainee not found' });
        }

        const {
            name,
            phone,
            subscriptionStartDate,
            totalCost,
            paid,
            program,
            couponCode, // 🔥 لازم نستقبله هنا
            sessionsCount // لو بيعدل عدد الحصص
        } = req.body;

        // 1. تحديث البيانات الأساسية
        if (name) trainee.name = name;
        if (phone) trainee.phone = phone;
        if (subscriptionStartDate) trainee.subscriptionStartDate = subscriptionStartDate;
        if (program !== undefined) trainee.program = program;
        if (totalCost !== undefined) trainee.totalCost = totalCost;
        if (paid !== undefined) trainee.paid = paid;
        if (sessionsCount !== undefined && trainee.isSession) trainee.sessionsRemaining = sessionsCount;

        // ---------------------------------------------------------
        // 2. منطق الكوبون (De-apply & Apply) 🔥 هذا هو الجزء الناقص
        // ---------------------------------------------------------

        // الحالة الأولى: حذف الكوبون (De-apply)
        if (couponCode === "") {
            trainee.discount = 0;
            trainee.usedCoupon = undefined; // أو undefined حسب السكيما
            trainee.appliedDiscount = {
                hasCustomDiscount: false,
                discountValue: 0,
                discountType: 'fixed' // قيمة افتراضية
            };
        }
        // الحالة الثانية: تغيير الكوبون أو إضافته لأول مرة
        else if (couponCode && couponCode !== trainee.usedCoupon) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true
            });

            if (coupon) {
                // (اختياري) ممكن تزود شروط الصلاحية هنا لو عايز تمنع الكوبونات المنتهية
                let discountAmount = 0;

                // تحديث الـ Metadata
                trainee.appliedDiscount = {
                    hasCustomDiscount: true,
                    discountValue: coupon.value,
                    discountType: coupon.discountType === 'PERCENTAGE' ? 'percentage' : 'fixed'
                };

                // حساب القيمة المالية
                if (coupon.discountType === 'PERCENTAGE') {
                    discountAmount = (trainee.totalCost * coupon.value) / 100;
                } else {
                    discountAmount = coupon.value;
                }

                trainee.discount = discountAmount;
                trainee.usedCoupon = coupon.code;
            }
        }

        // الحالة الثالثة: لو الكوبون هو هو ومسحناش حاجة -> مش بنعمل حاجة (بس لازم نعيد حساب الخصم لو السعر اتغير)
        // دي نقطة ذكية: لو انا مغيرتش الكوبون بس غيرت السعر من 1000 لـ 2000 والخصم نسبة مئوية؟
        // الـ Pre-save hook اللي عملناه زمان المفروض يظبط دي لو اعتمدنا عليه، أو نحسبها هنا يدوي للأمان:
        if (trainee.appliedDiscount?.hasCustomDiscount && trainee.appliedDiscount.discountType === 'percentage') {
            trainee.discount = (trainee.totalCost * trainee.appliedDiscount.discountValue) / 100;
        }


        // 3. الحفظ (الـ Pre-save Hook هيشتغل ويحسب الـ Remaining أوتوماتيك)
        const updatedTrainee = await trainee.save();

        res.status(200).json(updatedTrainee);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST: /api/trainees/:id/renew
router.post('/:id/renew', async (req: Request, res: Response): Promise<void> => {
    try {
        const { Trainees, Coupon } = db(req);

        const { id } = req.params;

        let discountAmount = 0;
        let finalUsedCouponCode = null;

        const appliedDiscountData = {
            hasCustomDiscount: false,
            discountValue: 0,
            discountType: "fixed"
        };


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
                        appliedDiscountData.discountType = 'percentage';
                    } else if (coupon.discountType === 'FIXED') {
                        discountAmount = coupon.value;
                        appliedDiscountData.discountType = 'fixed';
                    }

                    // تحديث الكوبون
                    coupon.usedCount += 1;

                    await coupon.save();

                    finalUsedCouponCode = coupon.code;
                    appliedDiscountData.hasCustomDiscount = true;
                    appliedDiscountData.discountValue = coupon.value;

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
        trainee.appliedDiscount = appliedDiscountData as any; // التفاصيل (عشان الـ Edit Form تفهم)

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



router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { Trainees } = db(req);
        const { id } = req.params;
        const updates = req.body;

        // 1. هات المشترك الأول
        const trainee = await Trainees.findById(id);

        if (!trainee) {
            return res.status(404).json({ error: 'Trainee not found' });
        }

        // 2. قائمة الحقول المسموح بتعديلها (عشان محدش يلعب في الـ ID أو التواريخ الحساسة بالغلط)
        const allowedUpdates = [
            'name',
            'phone',
            'totalCost',
            'paid',
            'sessionsRemaining',
            'subscriptionEndDate',
            'program',
            'discount', // لو حبيت تعدل الخصم يدوياً
            'appliedDiscount', // لو حبيت تشيل الكوبون
            'crmInfo' // لو حبيت تحدث حالة الواتساب
        ];

        // 3. تطبيق التعديلات
        const updatesKeys = Object.keys(updates);

        updatesKeys.forEach((key) => {
            if (allowedUpdates.includes(key)) {
                // @ts-ignore: عشان التايب سكريبت ميرخمش في الـ dynamic assignment
                trainee[key] = updates[key];
            }
        });

        // 4. حالة خاصة: لو بنعمل Clear Debt (بنخلي المدفوع = الصافي)
        // الـ Pre-save hook هيقوم بالواجب ويحسب الـ remaining

        // 5. حالة خاصة: لو بنعدل الـ appliedDiscount (مثلاً بنمسح الكوبون)
        // لازم نتأكد إننا مش بنبوظ الـ Schema
        if (updates.appliedDiscount) {
            trainee.appliedDiscount = {
                ...trainee.appliedDiscount,
                ...updates.appliedDiscount
            };
        }

        // 6. الحفظ (هنا السحر كله بيحصل والـ Hooks بتشتغل) 🔥
        const updatedTrainee = await trainee.save();

        res.status(200).json({
            success: true,
            message: "Trainee updated successfully",
            data: updatedTrainee
        });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;