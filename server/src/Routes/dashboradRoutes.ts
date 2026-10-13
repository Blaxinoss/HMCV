import express from 'express';
import type { Request, Response } from 'express';
import { DateTime } from 'luxon';
import { db } from '../models/index.js';
import { getLedgerSummaryMap } from '../services/financeService.js';
import { DEFAULT_GYM_TIMEZONE, endOfGymDay, startOfGymDay, toGymDateTime, utcNow } from '../utils/dateTime.js';

const router = express.Router();

const signedTransactionAmount = {
    $cond: [{ $eq: ['$type', 'refund'] }, { $multiply: ['$amountMinor', -1] }, '$amountMinor'],
};

const amountForType = (type: string) => ({
    $sum: { $cond: [{ $eq: ['$type', type] }, '$amountMinor', 0] },
});

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const { Trainees, Expense, Trainers, PaymentTransaction } = db(req);
        const now = utcNow();
        const gymNow = toGymDateTime(now);
        const requestedMonth = typeof req.query.month === 'string' ? req.query.month : null;
        const selectedMonth = requestedMonth
            ? DateTime.fromFormat(requestedMonth, 'yyyy-MM', { zone: DEFAULT_GYM_TIMEZONE })
            : gymNow.startOf('month');

        if (!selectedMonth.isValid || (requestedMonth && !/^\d{4}-\d{2}$/.test(requestedMonth))) {
            res.status(400).json({ success: false, error: 'month must use YYYY-MM format' });
            return;
        }

        const periodStart = selectedMonth.startOf('month').toUTC().toJSDate();
        const periodEnd = selectedMonth.plus({ months: 1 }).startOf('month').toUTC().toJSDate();
        const trendStart = selectedMonth.minus({ months: 5 }).startOf('month').toUTC().toJSDate();
        const todayStart = startOfGymDay(now);
        const todayEnd = endOfGymDay(now);
        const expiringWindowEnd = endOfGymDay(gymNow.plus({ days: 5 }).toJSDate());
        const lastSevenDaysStart = startOfGymDay(gymNow.minus({ days: 6 }).toJSDate());

        const [
            traineeDocuments, counts, attendanceByDay, peakHoursResult,
            revenueByMonth, expensesByMonth, expenseCategories, trainers,
            recentTransactions, recentExpenses, topMemberTotals,
            lifetimeRevenueResult, lifetimeExpenseResult,
        ] = await Promise.all([
            Trainees.find({ deleteFlag: false })
                .select('name memberId billingCycleId totalCost discount isSession subscriptionStartDate subscriptionEndDate accountFreezeStatus')
                .lean(),
            Promise.all([
                Trainees.countDocuments({ deleteFlag: false }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    accountFreezeStatus: false,
                    subscriptionStartDate: { $lte: now },
                    subscriptionEndDate: { $gte: todayStart },
                }),
                Trainees.countDocuments({ deleteFlag: false, accountFreezeStatus: true }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    accountFreezeStatus: false,
                    subscriptionEndDate: { $lt: todayStart },
                }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    accountFreezeStatus: false,
                    subscriptionStartDate: { $lte: now },
                    subscriptionEndDate: { $gte: todayStart, $lte: expiringWindowEnd },
                }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    lastAttendance: { $gte: todayStart, $lte: todayEnd },
                }),
                Trainees.countDocuments({ deleteFlag: false, createdAt: { $gte: periodStart, $lt: periodEnd } }),
                Trainees.countDocuments({
                    deleteFlag: false,
                    accountFreezeStatus: false,
                    subscriptionEndDate: { $gte: periodStart, $lt: periodEnd },
                }),
                Trainees.countDocuments({ deleteFlag: false, isSession: true }),
            ]),
            Trainees.aggregate([
                { $match: { deleteFlag: false } },
                { $unwind: '$attendanceHistory' },
                { $match: { 'attendanceHistory.checkIn': { $gte: lastSevenDaysStart, $lte: todayEnd } } },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d', date: '$attendanceHistory.checkIn', timezone: DEFAULT_GYM_TIMEZONE,
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Trainees.aggregate([
                { $match: { deleteFlag: false } },
                { $unwind: '$attendanceHistory' },
                { $match: { 'attendanceHistory.checkIn': { $gte: periodStart, $lt: periodEnd } } },
                {
                    $group: {
                        _id: { $hour: { date: '$attendanceHistory.checkIn', timezone: DEFAULT_GYM_TIMEZONE } },
                        count: { $sum: 1 },
                    },
                },
            ]),
            PaymentTransaction.aggregate([
                { $match: { status: 'posted', createdAt: { $gte: trendStart, $lt: periodEnd } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: DEFAULT_GYM_TIMEZONE },
                        },
                        paymentsMinor: amountForType('payment'),
                        refundsMinor: amountForType('refund'),
                        adjustmentsMinor: amountForType('adjustment'),
                        netRevenueMinor: { $sum: signedTransactionAmount },
                        transactionCount: { $sum: 1 },
                    },
                },
            ]),
            Expense.aggregate([
                { $match: { deleteFlag: false, dateOfPayment: { $gte: trendStart, $lt: periodEnd } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$dateOfPayment', timezone: DEFAULT_GYM_TIMEZONE },
                        },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Expense.aggregate([
                { $match: { deleteFlag: false, dateOfPayment: { $gte: periodStart, $lt: periodEnd } } },
                { $group: { _id: '$category', value: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { value: -1 } },
            ]),
            Trainers.find({ deleteFlag: false }).select('salary raise').lean(),
            PaymentTransaction.find({ status: 'posted' }).sort({ createdAt: -1 }).limit(15).lean(),
            Expense.find({ deleteFlag: false }).sort({ dateOfPayment: -1 }).limit(15).lean(),
            PaymentTransaction.aggregate([
                { $match: { status: 'posted' } },
                { $group: { _id: '$traineeId', netPaidMinor: { $sum: signedTransactionAmount } } },
                { $sort: { netPaidMinor: -1 } },
                { $limit: 20 },
            ]),
            PaymentTransaction.aggregate([
                { $match: { status: 'posted' } },
                { $group: { _id: null, totalMinor: { $sum: signedTransactionAmount } } },
            ]),
            Expense.aggregate([
                { $match: { deleteFlag: false } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        const summaries = await getLedgerSummaryMap(PaymentTransaction, traineeDocuments as any);
        const currentDebt = [...summaries.values()].reduce((sum, item) => sum + item.outstandingMinor, 0) / 100;
        const membersWithDebt = [...summaries.values()].filter(item => item.outstandingMinor > 0).length;
        const estimatedTrainerPayroll = trainers.reduce(
            (sum, trainer) => sum + Math.max(0, trainer.salary - (trainer.raise || 0)), 0,
        );

        const revenueMap = new Map(revenueByMonth.map(row => [row._id, row]));
        const expenseMap = new Map(expensesByMonth.map(row => [row._id, row]));
        const financialTrendLast6Months = Array.from({ length: 6 }, (_, index) => {
            const month = selectedMonth.minus({ months: 5 - index });
            const key = month.toFormat('yyyy-MM');
            const revenue = revenueMap.get(key);
            const expense = expenseMap.get(key);
            const netRevenue = (revenue?.netRevenueMinor || 0) / 100;
            const operatingExpenses = expense?.total || 0;
            const totalExpenses = operatingExpenses + estimatedTrainerPayroll;
            const netProfit = netRevenue - totalExpenses;
            return {
                month: key,
                label: month.toFormat('LLL yyyy'),
                payments: (revenue?.paymentsMinor || 0) / 100,
                refunds: (revenue?.refundsMinor || 0) / 100,
                adjustments: (revenue?.adjustmentsMinor || 0) / 100,
                revenue: netRevenue,
                operatingExpenses,
                estimatedTrainerPayroll,
                expenses: totalExpenses,
                netProfit,
                margin: netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0,
                transactionCount: revenue?.transactionCount || 0,
                expenseCount: expense?.count || 0,
            };
        });

        const selectedFinancials = financialTrendLast6Months[5];
        const activeInPeriod = traineeDocuments.filter(trainee => (
            trainee.subscriptionStartDate < periodEnd && trainee.subscriptionEndDate >= periodStart
        )).length;
        const expirationRate = activeInPeriod > 0 ? (counts[7] / activeInPeriod) * 100 : 0;

        const attendanceMap = new Map(attendanceByDay.map(row => [row._id, row.count]));
        const attendanceLast7Days = Array.from({ length: 7 }, (_, index) => {
            const day = gymNow.minus({ days: 6 - index });
            const date = day.toFormat('yyyy-MM-dd');
            return { date, label: day.toFormat('ccc'), count: attendanceMap.get(date) || 0 };
        });
        const peakMap = new Map(peakHoursResult.map(row => [row._id, row.count]));
        const peakHours = Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`, count: peakMap.get(hour) || 0,
        }));

        const topIds = topMemberTotals.map(row => row._id);
        const topTrainees = await Trainees.find({ _id: { $in: topIds }, deleteFlag: false })
            .select('name memberId isSession').lean();
        const traineeById = new Map(traineeDocuments.map(trainee => [String(trainee._id), trainee]));
        const topTraineeById = new Map(topTrainees.map(trainee => [String(trainee._id), trainee]));
        const topMembers = topMemberTotals.map(total => {
            const trainee = topTraineeById.get(String(total._id));
            if (!trainee) return null;
            return {
                _id: String(trainee._id), name: trainee.name, memberId: trainee.memberId,
                isSession: trainee.isSession, lifetimeSpend: total.netPaidMinor / 100,
                outstandingBalance: (summaries.get(String(trainee._id))?.outstandingMinor || 0) / 100,
            };
        }).filter(Boolean).slice(0, 5);

        const transactionActivities = recentTransactions.map(transaction => {
            const trainee = traineeById.get(String(transaction.traineeId));
            const isRefund = transaction.type === 'refund';
            const kindLabel = transaction.type === 'payment' ? 'Payment' : isRefund ? 'Refund' : 'Adjustment';
            return {
                id: String(transaction._id), type: isRefund ? 'EXPENSE' : 'INCOME', kind: transaction.type,
                label: `${kindLabel}: ${trainee?.name || 'Member'}`, memberName: trainee?.name,
                amount: transaction.amountMinor / 100,
                date: transaction.createdAt, category: transaction.reason || undefined,
            };
        });
        const expenseActivities = recentExpenses.map(expense => ({
            id: String(expense._id), type: 'EXPENSE', kind: 'expense', label: expense.name,
            amount: expense.amount, date: expense.dateOfPayment, category: expense.category,
        }));
        const recentActivity = [...transactionActivities, ...expenseActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        const expiringMembers = await Trainees.find({
            deleteFlag: false, accountFreezeStatus: false, subscriptionStartDate: { $lte: now },
            subscriptionEndDate: { $gte: todayStart, $lte: expiringWindowEnd },
        }).select('name memberId phone subscriptionEndDate').sort({ subscriptionEndDate: 1 }).limit(10).lean();

        res.status(200).json({
            success: true,
            data: {
                meta: {
                    timezone: DEFAULT_GYM_TIMEZONE, selectedMonth: selectedMonth.toFormat('yyyy-MM'),
                    generatedAt: now.toISOString(), payrollIsEstimated: true,
                },
                cards: {
                    totalMembers: counts[0], activeMembers: counts[1], frozenMembers: counts[2],
                    expiredMembers: counts[3], expiringSoon: counts[4], attendanceToday: counts[5],
                    newMembers: counts[6], expirationsInPeriod: counts[7], sessionMembers: counts[8],
                    monthlyMembers: counts[0] - counts[8], currentDebt, membersWithDebt,
                },
                financials: {
                    payments: selectedFinancials.payments, refunds: selectedFinancials.refunds,
                    adjustments: selectedFinancials.adjustments, netRevenue: selectedFinancials.revenue,
                    operatingExpenses: selectedFinancials.operatingExpenses, estimatedTrainerPayroll,
                    totalExpenses: selectedFinancials.expenses, netProfit: selectedFinancials.netProfit,
                    profitMargin: selectedFinancials.margin,
                    salaryRatio: selectedFinancials.revenue > 0
                        ? (estimatedTrainerPayroll / selectedFinancials.revenue) * 100 : 0,
                    arpu: activeInPeriod > 0 ? selectedFinancials.revenue / activeInPeriod : 0,
                    activeInPeriod, expirationRate,
                    lifetimeNetRevenue: (lifetimeRevenueResult[0]?.totalMinor || 0) / 100,
                    lifetimeOperatingExpenses: lifetimeExpenseResult[0]?.total || 0,
                },
                graphs: {
                    attendanceLast7Days, peakHours, financialTrendLast6Months,
                    expenseBreakdown: [
                        ...(estimatedTrainerPayroll > 0
                            ? [{ name: 'Estimated trainer payroll', value: estimatedTrainerPayroll, estimated: true }]
                            : []),
                        ...expenseCategories.map(item => ({
                            name: item._id, value: item.value, count: item.count, estimated: false,
                        })),
                    ],
                },
                lists: {
                    recentActivity, topMembers,
                    expiringMembers: expiringMembers.map(member => ({
                        _id: String(member._id), name: member.name, memberId: member.memberId,
                        phone: member.phone, subscriptionEndDate: member.subscriptionEndDate,
                    })),
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
