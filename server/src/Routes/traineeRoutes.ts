import express from "express"
import type { Request, Response } from 'express';
import type { AuthRequest } from '../../midware/verifyToken.js';
import axios from "axios"
import mongoose from "mongoose";
import { randomUUID } from 'node:crypto';
const router = express.Router();
import { db } from '../models/index.js';
import { redeemCoupon } from '../services/couponService.js';
import { createTransaction, getLedgerSummary, getLedgerSummaryMap, getNetPriceMinor, toMinorUnits } from '../services/financeService.js';
import { calculateFreezeStart, calculateUnfreezeEndDate, sameGymDay } from '../utils/freezePolicy.js';
import { recordAudit } from '../services/auditService.js';
import {
    addGymCalendarMonths,
    isExpired,
    parseGymDate,
    startOfGymDay,
    utcNow,
} from '../utils/dateTime.js';
// GET: Fetch all trainees
router.get('/', async (req: Request, res: Response) => {
    try {

        const { Trainees, PaymentTransaction } = db(req);


        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search ? (req.query.search as string).trim() : "";
        const status = req.query.status || "all"
        const skip = (page - 1) * limit;

        // 1. بناء جملة البحث (الذكية)
        let query: any = { deleteFlag: false };

        if (search) {
            const searchConditions = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];

            if (!isNaN(Number(search))) {
                searchConditions.push({ memberId: Number(search) } as any);
            }

            query.$or = searchConditions;
        }

        const today = utcNow();
        const todayStart = startOfGymDay(today);
        if (status === 'active') {
            query.subscriptionEndDate = { $gte: todayStart };
            query.accountFreezeStatus = false;
        } else if (status === 'expired') {
            query.subscriptionEndDate = { $lt: todayStart };
            query.accountFreezeStatus = false;
        } else if (status === 'frozen') {
            query.accountFreezeStatus = true;
        } else if (status === 'session') {
            query.isSession = true;
        }

        const trainees = await Trainees.find(query)
            .sort({ createdAt: -1 });

        const summaries = await getLedgerSummaryMap(PaymentTransaction, trainees);
        const traineesWithLedger = trainees.map(trainee => ({
                ...trainee.toObject(),
                ledgerSummary: summaries.get(String(trainee._id)),
            }));
        const filteredTrainees = status === 'debt'
            ? traineesWithLedger.filter(trainee => (trainee.ledgerSummary?.outstandingMinor ?? 0) > 0)
            : traineesWithLedger;
        const totalSearchBoxResults = filteredTrainees.length;
        const data = filteredTrainees.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            data,
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
        const { Trainees, Coupon, PaymentTransaction } = db(req);

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
            initialPaymentMinor = 0,
            couponCode,
            program,
        } = req.body;

        const normalizedStartDate = parseGymDate(subscriptionStartDate, 'start');
        const normalizedEndDate = parseGymDate(subscriptionEndDate, 'end');
        if (!normalizedStartDate || !normalizedEndDate || normalizedEndDate < normalizedStartDate) {
            res.status(400).json({ error: 'A valid subscription date range is required' });
            return;
        }

        let discountAmount = 0;
        let finalUsedCouponCode = null;
        const appliedDiscountData = {
            hasCustomDiscount: false, // لو فيه خصم يبقا true
            discountValue: 0,
            discountType: "fixed"
        };

        if (couponCode) {
            const redeemedCoupon = await redeemCoupon(Coupon, couponCode, Number(totalCost));
            if (redeemedCoupon) {
                discountAmount = redeemedCoupon.discountAmount;
                finalUsedCouponCode = redeemedCoupon.coupon.code;
                appliedDiscountData.hasCustomDiscount = true;
                appliedDiscountData.discountValue = redeemedCoupon.appliedDiscount.discountValue;
                appliedDiscountData.discountType = redeemedCoupon.appliedDiscount.discountType;
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
            subscriptionStartDate: normalizedStartDate,
            subscriptionEndDate: normalizedEndDate,
            totalCost,
            isSession,
            sessionsRemaining: isSession ? sessionsCount : 0,
            discount: discountAmount,
            program,
            usedCoupon: finalUsedCouponCode,
            appliedDiscount: appliedDiscountData,
        });

        if (!Number.isInteger(initialPaymentMinor) || initialPaymentMinor < 0) {
            res.status(400).json({ error: 'initialPaymentMinor must be a non-negative integer' });
            return;
        }
        if (initialPaymentMinor > getNetPriceMinor(newTrainee)) {
            res.status(400).json({ error: 'Initial payment exceeds the subscription price' });
            return;
        }

        const savedTrainee = await newTrainee.save();

        if (initialPaymentMinor > 0) {
            await createTransaction({
                transactionModel: PaymentTransaction,
                traineeId: savedTrainee._id,
                billingCycleId: savedTrainee.billingCycleId,
                type: 'payment',
                amountMinor: initialPaymentMinor,
                reason: 'Initial subscription payment',
            });
        }

        const ledgerSummary = await getLedgerSummary(
            PaymentTransaction,
            savedTrainee._id,
            savedTrainee.billingCycleId,
            getNetPriceMinor(savedTrainee),
        );

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


        res.status(201).json({
            success: true,
            data: { ...savedTrainee.toObject(), ledgerSummary },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

// POST: Record a payment, refund, or approved adjustment for a trainee.
router.post('/:id/transactions', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Trainees, PaymentTransaction, AuditLog } = db(req);

        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).json({ success: false, message: 'Invalid trainee ID' });
            return;
        }

        const trainee = await Trainees.findById(req.params.id);
        if (!trainee) {
            res.status(404).json({ success: false, message: 'Trainee not found' });
            return;
        }

        const { type = 'payment', amount, amountMinor, reason, reference } = req.body;
        const normalizedAmountMinor = amountMinor ?? toMinorUnits(Number(amount));

        if (!['payment', 'refund', 'adjustment'].includes(type)) {
            res.status(400).json({ success: false, message: 'Invalid transaction type' });
            return;
        }

        const currentSummary = await getLedgerSummary(
            PaymentTransaction,
            trainee._id,
            trainee.billingCycleId,
            getNetPriceMinor(trainee),
        );

        if ((type === 'payment' || type === 'adjustment') && normalizedAmountMinor > currentSummary.outstandingMinor) {
            res.status(400).json({ success: false, message: 'Transaction exceeds the outstanding balance' });
            return;
        }
        if (type === 'refund' && normalizedAmountMinor > currentSummary.netPaidMinor) {
            res.status(400).json({ success: false, message: 'Refund exceeds the paid balance' });
            return;
        }

        const transaction = await createTransaction({
            transactionModel: PaymentTransaction,
            traineeId: trainee._id,
            type,
            amountMinor: normalizedAmountMinor,
            reason,
            reference,
            createdBy: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
            billingCycleId: trainee.billingCycleId,
        });
        await recordAudit({
            auditLogModel: AuditLog,
            action: type === 'payment' ? 'payment.recorded' : `transaction.${type}.recorded`,
            entity: 'PaymentTransaction',
            entityId: String(transaction._id),
            actorUserId: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
            requestId: req.headers['x-request-id'] as string | undefined,
            after: { traineeId: String(trainee._id), billingCycleId: trainee.billingCycleId, type, amountMinor: normalizedAmountMinor },
        });
        const summary = await getLedgerSummary(
            PaymentTransaction,
            trainee._id,
            trainee.billingCycleId,
            getNetPriceMinor(trainee),
        );

        res.status(201).json({
            success: true,
            message: 'Financial transaction recorded',
            data: {
                transaction,
                summary,
                trainee: { ...trainee.toObject(), ledgerSummary: summary },
            },
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// GET: Return the immutable financial history and derived balance.
router.get('/:id/transactions', async (req: Request, res: Response): Promise<void> => {
    try {
        const { Trainees, PaymentTransaction } = db(req);

        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).json({ success: false, message: 'Invalid trainee ID' });
            return;
        }

        const trainee = await Trainees.findById(req.params.id);
        if (!trainee) {
            res.status(404).json({ success: false, message: 'Trainee not found' });
            return;
        }

        const transactions = await PaymentTransaction.find({ traineeId: trainee._id })
            .sort({ createdAt: -1 });
        const summary = await getLedgerSummary(PaymentTransaction, trainee._id, trainee.billingCycleId, getNetPriceMinor(trainee));

        res.status(200).json({ success: true, data: { transactions, summary } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});


router.put('/:id/freeze', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { Trainees, AuditLog, PaymentTransaction } = db(req);

        const trainee = await Trainees.findById(req.params.id);

        if (!trainee) {
            res.status(404).json({ error: 'Trainee not found' });
            return;
        }

        const currentDate = utcNow();
        const beforeFreeze = {
            accountFreezeStatus: trainee.accountFreezeStatus,
            freezeStartDate: trainee.freezeStartDate,
            subscriptionEndDate: trainee.subscriptionEndDate,
        };
        const reason = typeof req.body.reason === 'string' && req.body.reason.trim()
            ? req.body.reason.trim()
            : 'Manual membership freeze';
        const previousEndDate = trainee.subscriptionEndDate;

        // -------------------------------------------------------
        //(Unfreeze)
        // -------------------------------------------------------
        if (trainee.accountFreezeStatus) {
            if (trainee.freezeStartDate) {
                const result = calculateUnfreezeEndDate(
                    trainee.subscriptionEndDate,
                    trainee.freezeStartDate,
                    currentDate,
                );
                trainee.subscriptionEndDate = result.endDate;
            }

            trainee.freezeStartDate = null;
            trainee.accountFreezeStatus = false;
            trainee.freezeHistory.push({
                action: 'unfreeze',
                actorUserId: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
                reason,
                effectiveDate: currentDate,
                previousEndDate,
                resultingEndDate: trainee.subscriptionEndDate,
                createdAt: currentDate,
            });

            // -------------------------------------------------------
            // (Freeze)
            // -------------------------------------------------------
        } else {
            if (isExpired(trainee.subscriptionEndDate, currentDate)) {
                res.status(400).json({ error: 'Cannot freeze an expired subscription' });
                return;
            }

            const summary = await getLedgerSummary(
                PaymentTransaction,
                trainee._id,
                trainee.billingCycleId,
                getNetPriceMinor(trainee),
            );
            if (summary.outstandingMinor > 0) {
                res.status(400).json({
                    error: `Cannot freeze account with outstanding debt (${summary.outstandingMinor / 100} EGP). Please clear debt first.`
                });
                return;
            }

            const freezeStart = calculateFreezeStart(currentDate, trainee.lastAttendance);

            trainee.accountFreezeStatus = true;
            trainee.freezeStartDate = freezeStart;
            trainee.freezeHistory.push({
                action: 'freeze',
                actorUserId: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
                reason,
                effectiveDate: freezeStart,
                previousEndDate,
                resultingEndDate: previousEndDate,
                createdAt: currentDate,
            });
        }

        const updatedTrainee = await trainee.save();
        await recordAudit({
            auditLogModel: AuditLog,
            action: updatedTrainee.accountFreezeStatus ? 'subscription.frozen' : 'subscription.unfrozen',
            entity: 'Trainee',
            entityId: String(updatedTrainee._id),
            actorUserId: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
            requestId: req.headers['x-request-id'] as string | undefined,
            before: beforeFreeze,
            after: {
                accountFreezeStatus: updatedTrainee.accountFreezeStatus,
                freezeStartDate: updatedTrainee.freezeStartDate,
                subscriptionEndDate: updatedTrainee.subscriptionEndDate,
            },
        });

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
        if (error instanceof mongoose.Error.VersionError) {
            res.status(409).json({ error: 'Trainee changed by another request. Please reload and try again.' });
            return;
        }
        res.status(400).json({ error: error.message });
    }
});

router.post("/check-in/:id", async (req: Request, res: Response) => {
    const { Trainees, PaymentTransaction } = db(req);

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



    const today = utcNow();
    if (isExpired(trainee.subscriptionEndDate, today)) {
        return res.status(400).json({ error: "Cannot check-in: Subscription EXPIRED ⏳" });
    }

    // 3. فحص عدد الحصص (لو مشترك حصص)
    if (trainee.isSession && trainee.sessionsRemaining <= 0) {
        return res.status(400).json({ error: "Cannot check-in: No Sessions Remaining 🎫" });
    }

    if (trainee.lastAttendance && sameGymDay(trainee.lastAttendance, today)) {
        return res.status(400).json({ error: "Already checked in today!" });
    }

    let warnings = [];

    // ---------------------------------------------------------
    // Session Case
    // -----------------------------------------------------
    if (trainee.isSession) {



        if (trainee.sessionsRemaining <= 0) {
            return res.status(400).json({
                error: "No sessions left! Please renew. 🎟️",
                sessionsRemaining: 0
            });
        }

        trainee.sessionsRemaining -= 1;

    } else {
        // Date expiry was checked before reaching this branch.
    }


    const summary = await getLedgerSummary(
        PaymentTransaction,
        trainee._id,
        trainee.billingCycleId,
        getNetPriceMinor(trainee),
    );
    if (summary.outstandingMinor > 0) {
        warnings.push(`Has Debt: ${summary.outstandingMinor / 100}`);
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
        const { Trainees, PaymentTransaction } = db(req);

        const trainee = await Trainees.findById(req.params.id);
        if (!trainee) {
            res.status(404).json({ error: 'Trainee not found' });
            return;
        }
        const summary = await getLedgerSummary(
            PaymentTransaction,
            trainee._id,
            trainee.billingCycleId,
            getNetPriceMinor(trainee),
        );
        res.status(200).json({
            success: true,
            data: {
                ...trainee.toObject(),
                ledgerSummary: summary,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Remove trainee
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { Trainees, AuditLog } = db(req);
        const deletedTrainee = await Trainees.findByIdAndUpdate(
            req.params.id,
            {
                deleteFlag: true,
                deletedAt: utcNow(),
                deletedBy: req.user?.id,
            },
            { new: true },
        );
        if (!deletedTrainee) {
            res.status(404).json({ error: 'Trainee not found' });
            return;
        }
        await recordAudit({
            auditLogModel: AuditLog,
            action: 'trainee.deleted',
            entity: 'Trainee',
            entityId: String(deletedTrainee._id),
            actorUserId: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
            requestId: req.headers['x-request-id'] as string | undefined,
            after: { deleteFlag: true, deletedAt: deletedTrainee.deletedAt },
        });
        res.status(200).json({ message: 'Trainee deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
// PUT: Update trainee details
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { Trainees, PaymentTransaction } = db(req);
        const { id } = req.params;

        const trainee = await Trainees.findById(id);

        if (!trainee) {
            return res.status(404).json({ error: 'Trainee not found' });
        }

        const protectedFields = [
            'subscriptionStartDate',
            'subscriptionEndDate',
            'totalCost',
            'discount',
            'couponCode',
            'appliedDiscount',
            'usedCoupon',
            'isSession',
            'sessionsCount',
            'sessionsRemaining',
            'billingCycleId',
            'accountFreezeStatus',
            'freezeStartDate',
        ];
        const attemptedProtectedFields = protectedFields.filter(field => field in req.body);
        if (attemptedProtectedFields.length > 0) {
            return res.status(400).json({
                error: 'Subscription terms cannot be changed from the regular edit endpoint. Use the renewal, freeze, or transaction endpoint.',
                fields: attemptedProtectedFields,
            });
        }

        const { name, phone, program } = req.body;
        if (name !== undefined) trainee.name = name;
        if (phone !== undefined) trainee.phone = phone;
        if (program !== undefined) trainee.program = program;

        const updatedTrainee = await trainee.save();

        const summary = await getLedgerSummary(
            PaymentTransaction,
            updatedTrainee._id,
            updatedTrainee.billingCycleId,
            getNetPriceMinor(updatedTrainee),
        );
        res.status(200).json({
            success: true,
            data: { ...updatedTrainee.toObject(), ledgerSummary: summary },
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST: /api/trainees/:id/renew
router.post('/:id/renew', async (req: Request, res: Response): Promise<void> => {
    try {
        const { Trainees, Coupon, PaymentTransaction } = db(req);

        const { id } = req.params;

        let discountAmount = 0;
        let finalUsedCouponCode = null;

        const appliedDiscountData = {
            hasCustomDiscount: false,
            discountValue: 0,
            discountType: "fixed"
        };


        const {
            durationInMonths,
            durationInDays, // Legacy client compatibility: 30 days represents one calendar month.
            totalCost,      // سعر الباقة الجديد
            paymentAmountMinor = 0,
            couponCode,      // الكوبون (اختياري)
            sessionsCount
        } = req.body;

        const renewalMonths = durationInMonths ?? (
            Number.isInteger(durationInDays) && durationInDays > 0 && durationInDays % 30 === 0
                ? durationInDays / 30
                : null
        );
        if (!Number.isInteger(renewalMonths) || renewalMonths <= 0) {
            res.status(400).json({ error: 'durationInMonths must be a positive integer' });
            return;
        }

        const trainee = await Trainees.findById(id);

        if (!trainee) {
            res.status(404).json({ error: "Trainee not found" });
            return;
        }

        if (trainee.accountFreezeStatus) {
            res.status(409).json({
                success: false,
                error: 'Cannot renew a frozen subscription. Unfreeze the trainee first.',
            });
            return;
        }

        const existingSummary = await getLedgerSummary(
            PaymentTransaction,
            trainee._id,
            trainee.billingCycleId,
            getNetPriceMinor(trainee),
        );

        if (existingSummary.outstandingMinor > 0) {
            res.status(400).json({
                success: false,
                error: `Cannot renew. Trainee has an outstanding debt of ${existingSummary.outstandingMinor / 100} EGP. Please clear debt first.`
            });
            return;
        }


        // 1. منطق التواريخ (Date Logic)
        const today = utcNow();
        let newStartDate = startOfGymDay(today);
        const currentEndDate = trainee.subscriptionEndDate;

        // لو اشتراكه لسه ساري، ابدأ التجديد من بعد ما يخلص
        if (!isExpired(currentEndDate, today)) {
            newStartDate = currentEndDate;
        }
        // لو منتهي، ابدأ من النهاردة (newStartDate already = today)

        // حساب تاريخ الانتهاء الجديد
        const newEndDate = addGymCalendarMonths(newStartDate, renewalMonths);



        if (couponCode) {
            const redeemedCoupon = await redeemCoupon(Coupon, couponCode, Number(totalCost));
            if (redeemedCoupon) {
                discountAmount = redeemedCoupon.discountAmount;
                finalUsedCouponCode = redeemedCoupon.coupon.code;
                appliedDiscountData.hasCustomDiscount = true;
                appliedDiscountData.discountValue = redeemedCoupon.appliedDiscount.discountValue;
                appliedDiscountData.discountType = redeemedCoupon.appliedDiscount.discountType;
            }
        }

        // 3. تحديث بيانات العميل
        // خلي بالك: احنا بنصفر الديون القديمة وبنبدأ حساب جديد للشهر ده
        // أو ممكن تجمع الديون القديمة لو حابب (Business Decision)
        // هنا هنفترض إن التجديد عملية جديدة منفصلة

        const normalizedPaymentMinor = paymentAmountMinor;
        const renewedNetPriceMinor = toMinorUnits(Math.max(0, Number(totalCost) - discountAmount));
        if (!Number.isInteger(normalizedPaymentMinor) || normalizedPaymentMinor < 0) {
            res.status(400).json({ error: 'Payment must be a non-negative amount in minor currency units' });
            return;
        }
        if (normalizedPaymentMinor > renewedNetPriceMinor) {
            res.status(400).json({ error: 'Payment exceeds the renewed subscription price' });
            return;
        }
        trainee.subscriptionStartDate = newStartDate;
        trainee.subscriptionEndDate = newEndDate;
        trainee.totalCost = totalCost;
        trainee.discount = discountAmount;
        trainee.billingCycleId = randomUUID();
        trainee.usedCoupon = finalUsedCouponCode || undefined; // سجل الكوبون الجديد
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
        await trainee.save();

        if (normalizedPaymentMinor > 0) {
            await createTransaction({
                transactionModel: PaymentTransaction,
                traineeId: trainee._id,
                billingCycleId: trainee.billingCycleId,
                type: 'payment',
                amountMinor: normalizedPaymentMinor,
                reason: 'Subscription renewal payment',
            });
        }

        const renewedSummary = await getLedgerSummary(
            PaymentTransaction,
            trainee._id,
            trainee.billingCycleId,
            getNetPriceMinor(trainee),
        );

        res.status(200).json({
            success: true,
            message: "Subscription Renewed Successfully",
            data: {
                ...trainee.toObject(),
                ledgerSummary: renewedSummary,
            }
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { Trainees, PaymentTransaction } = db(req);
        const { id } = req.params;
        const updates = { ...req.body };

        const allowedUpdates = ['name', 'phone', 'program', 'crmInfo'];
        const rejectedUpdates = Object.keys(updates).filter(key => !allowedUpdates.includes(key));
        if (rejectedUpdates.length > 0) {
            return res.status(400).json({
                error: 'Subscription terms cannot be changed from the regular patch endpoint. Use the dedicated endpoint.',
                fields: rejectedUpdates,
            });
        }

        // 1. هات المشترك الأول
        const trainee = await Trainees.findById(id);

        if (!trainee) {
            return res.status(404).json({ error: 'Trainee not found' });
        }

        const updatesKeys = Object.keys(updates);

        updatesKeys.forEach((key) => {
            if (allowedUpdates.includes(key)) {
                // @ts-ignore Dynamic assignment is restricted by allowedUpdates.
                trainee[key] = updates[key];
            }
        });

        const updatedTrainee = await trainee.save();

        const summary = await getLedgerSummary(
            PaymentTransaction,
            updatedTrainee._id,
            updatedTrainee.billingCycleId,
            getNetPriceMinor(updatedTrainee),
        );

        res.status(200).json({
            success: true,
            message: "Trainee updated successfully",
            data: { ...updatedTrainee.toObject(), ledgerSummary: summary }
        });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
