// src/utils/businessLogic.ts
import { Trainee, Expense, Trainer } from '../types';

export const calculateMonthlyStats = (
    trainees: Trainee[],
    expenses: Expense[],
    trainers: Trainer[],
    selectedDate: Date
) => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    // 1. Filter Data for this Month
    const monthlyRevenue = trainees
        .filter(t => {
            const d = new Date(t.createdAt); // Or payment date if available
            return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.paid, 0);

    const monthlyExpenses = expenses
        .filter(e => {
            const d = new Date(e.dateOfPayment);
            return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    // Salaries are fixed monthly expenses
    const monthlySalaries = trainers.reduce((sum, t) => sum + (t.salaryAfterDiscount || t.salary), 0);

    const totalMonthlyOutflow = monthlyExpenses + monthlySalaries;
    const netProfit = monthlyRevenue - totalMonthlyOutflow;

    // 2. Business Metrics
    const activeUsersThisMonth = trainees.filter(t => {
        const start = new Date(t.subscriptionStartDate);
        const end = new Date(t.subscriptionEndDate);
        const target = new Date(year, month, 15); // Check mid-month
        return start <= target && end >= target;
    }).length;

    // ARPU: Average Revenue Per User
    const arpu = activeUsersThisMonth > 0 ? monthlyRevenue / activeUsersThisMonth : 0;

    // Profit Margin
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

    // Churn (Users who expired this month and didn't renew)
    // *Simplified logic for demo*
    const expiredThisMonth = trainees.filter(t => {
        const d = new Date(t.subscriptionEndDate);
        return d.getMonth() === month && d.getFullYear() === year;
    }).length;

    // Assuming if they are active, they renewed. If expired count is high vs active, churn is high.
    const churnRate = activeUsersThisMonth > 0 ? (expiredThisMonth / activeUsersThisMonth) * 100 : 0;

    return {
        revenue: monthlyRevenue,
        expenses: totalMonthlyOutflow,
        netProfit,
        activeUsers: activeUsersThisMonth,
        arpu,
        profitMargin,
        churnRate,
        newSignups: trainees.filter(t => {
            const d = new Date(t.subscriptionStartDate);
            return d.getMonth() === month && d.getFullYear() === year;
        }).length
    };
};

export const getFinancialHealthColor = (margin: number) => {
    if (margin >= 30) return 'text-green-400';
    if (margin >= 10) return 'text-blue-400';
    if (margin >= 0) return 'text-yellow-400';
    return 'text-red-500';
};

export const calculatePeakHours = (trainees: Trainee[]) => {
    const hoursMap = new Array(24).fill(0);

    trainees.forEach(t => {
        if (t.attendanceHistory) {
            t.attendanceHistory.forEach(record => {
                const date = new Date(record.checkIn);
                const hour = date.getHours();
                hoursMap[hour]++;
            });
        }
    });

    return hoursMap.map((count, hour) => ({
        hour: `${hour}:00`,
        count,
        intensity: count > 0 ? count : 0 // For color scaling
    }));
};

/**
 * Merges Trainee Payments and Expenses into a single sorted timeline.
 */
export const getRecentTransactions = (trainees: Trainee[], expenses: Expense[], limit = 10) => {
    const incomes = trainees.map(t => ({
        id: t._id,
        type: 'INCOME',
        label: `Payment: ${t.name}`,
        amount: t.paid,
        date: new Date(t.createdAt), // Or update this to a real paymentDate field if you have it
        category: t.isSession ? 'Session Pack' : 'Subscription'
    }));

    const outflows = expenses.map(e => ({
        id: e._id,
        type: 'EXPENSE',
        label: e.name,
        amount: e.amount,
        date: new Date(e.dateOfPayment),
        category: e.category
    }));

    // Merge and Sort by Date DESC
    return [...incomes, ...outflows]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);
};