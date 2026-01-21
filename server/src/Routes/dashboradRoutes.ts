import express from 'express';
import type { Request, Response } from 'express'
import Trainees from '../models/Trainees.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const [
            counts,
            financials,
            attendanceGraph,
            revenueGraph,
            expensesTotal,
            revenueTotal
        ] = await Promise.all([

            // 1. العدادات الأساسية (Snapshot)
            Promise.all([
                Trainees.countDocuments({}), // Total
                Trainees.countDocuments({ accountFreezeStatus: false, subscriptionEndDate: { $gte: today } }), // Active
                Trainees.countDocuments({ subscriptionEndDate: { $gte: today, $lte: new Date(today.getTime() + 5 * 86400000) } }), // Expiring
                Trainees.countDocuments({ lastAttendance: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }) // Today's Attendance
            ]),

            // 2. إجمالي الديون (Aggregation)
            Trainees.aggregate([
                { $match: { remaining: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: "$remaining" } } }
            ]),

            // 3. (جديد) الرسم البياني للحضور أخر 7 أيام 📊
            // النتيجة هتكون: [{date: "2026-01-20", count: 15}, {date: "2026-01-21", count: 20}]
            // ملحوظة: ده بيتطلب إن attendanceHistory يكون Array of Dates في السكيما
            Trainees.aggregate([
                { $unwind: "$attendanceHistory" }, // نفك مصفوفة التاريخ
                {
                    $match: {
                        "attendanceHistory.checkIn": { $gte: new Date(new Date().setDate(today.getDate() - 7)) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$attendanceHistory.checkIn" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),

            // 4. (جديد) الرسم البياني للدخل أخر 6 شهور 💰
            // النتيجة: [{_id: 1, total: 5000}, {_id: 2, total: 7000}] (حسب الشهر)
            Trainees.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo } // هات الناس بتوع أخر 6 شهور
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" }, // جمعهم بالشهر (1, 2, 3...)
                        monthName: { $first: { $month: "$createdAt" } }, // ممكن نحسنها لاسم الشهر
                        totalRevenue: { $sum: "$paid" },
                        count: { $sum: 1 } // وكمان عدد المشتركين في الشهر ده
                    }
                },
                { $sort: { "_id": 1 } }
            ]),

            Expense.aggregate([
                { $match: {} },
                {
                    $group: {
                        _id: null,
                        totalExpenses: { $sum: "$amount" }
                    }
                }
            ]),
            Trainees.aggregate([
                { $group: { _id: null, totalPaid: { $sum: "$paid" } } }
            ])
        ]);

        const totalDebt = financials[0]?.total || 0;
        const totalLifetimeRevenue = revenueTotal[0]?.totalPaid || 0;
        const totalLifetimeExpenses = expensesTotal[0]?.totalExpenses || 0;
        const netProfit = totalLifetimeRevenue - totalLifetimeExpenses;
        res.status(200).json({
            success: true,
            data: {
                cards: {
                    totalMembers: counts[0],
                    activeMembers: counts[1],
                    expiringSoon: counts[2],
                    attendanceToday: counts[3],
                    totalDebt: totalDebt,
                    totalRevenue: totalLifetimeRevenue, // اعرضله ده
                    totalExpenses: totalLifetimeExpenses,
                    netProfit: netProfit
                },
                graphs: {
                    attendanceLast7Days: attendanceGraph, // ارمي ده في Bar Chart
                    revenueLast6Months: revenueGraph      // ارمي ده في Line/Area Chart
                }
            }
        });

    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;