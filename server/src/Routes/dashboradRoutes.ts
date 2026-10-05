import express from 'express';
import type { Request, Response } from 'express';
import { db } from '../models/index.js';
import { getLedgerSummaryMap } from '../services/financeService.js';

const router = express.Router();

router.get('/raw-data', async (req: Request, res: Response) => {
    try {
        const { Trainees, Expense, Trainers, PaymentTransaction } = db(req);
        const [traineeDocuments, expenses, trainers, transactions] = await Promise.all([
            Trainees.find({ deleteFlag: false }),
            Expense.find({ deleteFlag: false }),
            Trainers.find({ deleteFlag: false }),
            PaymentTransaction.find({ status: 'posted' }).sort({ createdAt: -1 }),
        ]);
        const summaries = await getLedgerSummaryMap(PaymentTransaction, traineeDocuments);
        const trainees = traineeDocuments.map(trainee => ({
            ...trainee.toObject(),
            ledgerSummary: summaries.get(String(trainee._id)),
        }));

        res.json({
            success: true,
            data: { trainees, expenses, trainers, transactions },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const signedTransactionAmount = {
    $cond: [
        { $eq: ['$type', 'refund'] },
        { $multiply: ['$amountMinor', -1] },
        '$amountMinor',
    ],
};

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const { Trainees, Expense, PaymentTransaction } = db(req);
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const [
            counts,
            totalDebt,
            attendanceGraph,
            revenueGraph,
            expenseTotals,
            revenueTotals,
        ] = await Promise.all([
            Promise.all([
                Trainees.countDocuments({ deleteFlag: false }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    accountFreezeStatus: false,
                    subscriptionEndDate: { $gte: today },
                }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    subscriptionEndDate: {
                        $gte: today,
                        $lte: new Date(today.getTime() + 5 * 86400000),
                    },
                }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    lastAttendance: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                }),
            ]),
            (async () => {
                const trainees = await Trainees.find({ deleteFlag: false });
                const summaries = await getLedgerSummaryMap(PaymentTransaction, trainees);
                return [...summaries.values()].reduce(
                    (total, summary) => total + summary.outstandingMinor,
                    0,
                ) / 100;
            })(),
            Trainees.aggregate([
                { $match: { deleteFlag: false } },
                { $unwind: '$attendanceHistory' },
                {
                    $match: {
                        'attendanceHistory.checkIn': {
                            $gte: new Date(new Date().setDate(today.getDate() - 7)),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$attendanceHistory.checkIn' } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            PaymentTransaction.aggregate([
                { $match: { status: 'posted', createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        monthName: { $first: { $month: '$createdAt' } },
                        totalRevenueMinor: { $sum: signedTransactionAmount },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $set: { totalRevenue: { $divide: ['$totalRevenueMinor', 100] } } },
                {
                    $project: {
                        _id: '$_id.month',
                        monthName: 1,
                        totalRevenue: 1,
                        count: 1,
                    },
                },
            ]),
            Expense.aggregate([
                { $match: { deleteFlag: false } },
                { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
            ]),
            PaymentTransaction.aggregate([
                { $match: { status: 'posted' } },
                {
                    $group: {
                        _id: null,
                        totalPaidMinor: { $sum: signedTransactionAmount },
                    },
                },
            ]),
        ]);

        const totalLifetimeRevenue = (revenueTotals[0]?.totalPaidMinor || 0) / 100;
        const totalLifetimeExpenses = expenseTotals[0]?.totalExpenses || 0;

        res.status(200).json({
            success: true,
            data: {
                cards: {
                    totalMembers: counts[0],
                    activeMembers: counts[1],
                    expiringSoon: counts[2],
                    attendanceToday: counts[3],
                    totalDebt,
                    totalRevenue: totalLifetimeRevenue,
                    totalExpenses: totalLifetimeExpenses,
                    netProfit: totalLifetimeRevenue - totalLifetimeExpenses,
                },
                graphs: {
                    attendanceLast7Days: attendanceGraph,
                    revenueLast6Months: revenueGraph,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
