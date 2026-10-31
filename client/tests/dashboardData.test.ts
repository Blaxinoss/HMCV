import { describe, expect, test } from 'bun:test';
import { parseDashboardData } from '../src/utils/dashboardData';

const currentDashboardResponse = {
  meta: {
    timezone: 'Africa/Cairo',
    selectedMonth: '2026-10',
    generatedAt: '2026-10-31T00:00:00.000Z',
    payrollIsEstimated: true,
  },
  cards: {
    totalMembers: 0,
    activeMembers: 0,
    frozenMembers: 0,
    expiredMembers: 0,
    expiringSoon: 0,
    attendanceToday: 0,
    newMembers: 0,
    expirationsInPeriod: 0,
    sessionMembers: 0,
    monthlyMembers: 0,
    currentDebt: 0,
    membersWithDebt: 0,
  },
  financials: {
    payments: 0,
    refunds: 0,
    adjustments: 0,
    netRevenue: 0,
    operatingExpenses: 0,
    estimatedTrainerPayroll: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    salaryRatio: 0,
    arpu: 0,
    activeInPeriod: 0,
    expirationRate: 0,
    lifetimeNetRevenue: 0,
    lifetimeOperatingExpenses: 0,
  },
  graphs: {
    attendanceLast7Days: [],
    peakHours: [],
    financialTrendLast6Months: [],
    expenseBreakdown: [],
  },
  lists: {
    topMembers: [],
    recentActivity: [],
    expiringMembers: [],
  },
};

describe('dashboard API response validation', () => {
  test('accepts the current dashboard contract', () => {
    expect(parseDashboardData(currentDashboardResponse)).toBe(currentDashboardResponse);
  });

  test('rejects the legacy production response before React renders it', () => {
    expect(() => parseDashboardData({
      cards: { totalMembers: 10 },
      graphs: { attendanceLast7Days: [], revenueLast6Months: [] },
    })).toThrow('incompatible with this app version');
  });
});
