import { DashboardData } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const hasNumbers = (value: Record<string, unknown>, fields: string[]) => (
  fields.every(field => typeof value[field] === 'number')
);

export function parseDashboardData(value: unknown): DashboardData {
  if (!isRecord(value)) {
    throw new Error('The dashboard API returned no data.');
  }

  const { meta, cards, financials, graphs, lists } = value;
  const hasValidMeta = isRecord(meta)
    && typeof meta.timezone === 'string'
    && typeof meta.selectedMonth === 'string'
    && typeof meta.generatedAt === 'string'
    && typeof meta.payrollIsEstimated === 'boolean';
  const hasValidCards = isRecord(cards) && hasNumbers(cards, [
    'totalMembers', 'activeMembers', 'frozenMembers', 'expiredMembers',
    'expiringSoon', 'attendanceToday', 'newMembers', 'expirationsInPeriod',
    'sessionMembers', 'monthlyMembers', 'currentDebt', 'membersWithDebt',
  ]);
  const hasValidFinancials = isRecord(financials) && hasNumbers(financials, [
    'payments', 'refunds', 'adjustments', 'netRevenue', 'operatingExpenses',
    'estimatedTrainerPayroll', 'totalExpenses', 'netProfit', 'profitMargin',
    'salaryRatio', 'arpu', 'activeInPeriod', 'expirationRate',
    'lifetimeNetRevenue', 'lifetimeOperatingExpenses',
  ]);
  const hasValidGraphs = isRecord(graphs)
    && Array.isArray(graphs.attendanceLast7Days)
    && Array.isArray(graphs.peakHours)
    && Array.isArray(graphs.financialTrendLast6Months)
    && Array.isArray(graphs.expenseBreakdown);
  const hasValidLists = isRecord(lists)
    && Array.isArray(lists.topMembers)
    && Array.isArray(lists.recentActivity)
    && Array.isArray(lists.expiringMembers);

  if (!hasValidMeta || !hasValidCards || !hasValidFinancials || !hasValidGraphs || !hasValidLists) {
    throw new Error(
      'The dashboard API is incompatible with this app version. Deploy the client and API from the same commit.',
    );
  }

  return value as unknown as DashboardData;
}
