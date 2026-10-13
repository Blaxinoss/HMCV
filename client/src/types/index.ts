// src/types/index.ts

export interface User {

  _id: string;
  username: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface AuthUser extends User {
  token: string;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: User;
}
export interface DashboardCards {
  totalMembers: number;
  activeMembers: number;
  frozenMembers: number;
  expiredMembers: number;
  expiringSoon: number;
  attendanceToday: number;
  newMembers: number;
  expirationsInPeriod: number;
  sessionMembers: number;
  monthlyMembers: number;
  currentDebt: number;
  membersWithDebt: number;
}

export interface DashboardFinancials {
  payments: number;
  refunds: number;
  adjustments: number;
  netRevenue: number;
  operatingExpenses: number;
  estimatedTrainerPayroll: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  salaryRatio: number;
  arpu: number;
  activeInPeriod: number;
  expirationRate: number;
  lifetimeNetRevenue: number;
  lifetimeOperatingExpenses: number;
}

export interface TrendPoint {
  _id: { month: number; year: number };
  total: number;
}

export interface AttendancePoint {
  _id: string; // "YYYY-MM-DD"
  count: number;
}

export interface PeakHourPoint {
  _id: number; // Hour (0-23)
  count: number;
}

export interface DashboardGraphs {
  attendanceLast7Days: Array<{ date: string; label: string; count: number }>;
  peakHours: Array<{ hour: string; count: number }>;
  financialTrendLast6Months: Array<{
    month: string;
    label: string;
    payments: number;
    refunds: number;
    adjustments: number;
    revenue: number;
    operatingExpenses: number;
    estimatedTrainerPayroll: number;
    expenses: number;
    netProfit: number;
    margin: number;
    transactionCount: number;
    expenseCount: number;
  }>;
  expenseBreakdown: Array<{ name: string; value: number; count?: number; estimated: boolean }>;
}

export interface TopMember {
  _id: string;
  name: string;
  memberId?: number;
  isSession: boolean;
  lifetimeSpend: number;
  outstandingBalance: number;
}

export interface DashboardLists {
  topMembers: TopMember[];
  recentActivity: Array<{
    id: string;
    type: 'INCOME' | 'EXPENSE';
    kind: 'payment' | 'refund' | 'adjustment' | 'expense';
    label: string;
    amount: number;
    date: string;
    category: string;
  }>;
  expiringMembers: Array<{
    _id: string;
    name: string;
    memberId?: number;
    phone: string;
    subscriptionEndDate: string;
  }>;
}

export interface DashboardData {
  meta: {
    timezone: string;
    selectedMonth: string;
    generatedAt: string;
    payrollIsEstimated: boolean;
  };
  cards: DashboardCards;
  financials: DashboardFinancials;
  graphs: DashboardGraphs;
  lists: DashboardLists;
}

export interface DashboardState {
  stats: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export interface Expense {
  _id: string;
  name: string;
  category: 'Bills' | 'Rent' | 'Utilities' |
  'Equipment' |
  'Marketing' |
  'Salaries' |
  'Maintenance' |
  'Insurance' |
  'Supplies' |
  'Other';
  amount: number;
  dateOfPayment: string;
  createdAt: string;
  description?: string;
}

export interface Trainer {
  _id: string;
  name: string;
  phone: number;
  salary: number;
  raise: number; // في الباك إند عندك بتتحسب خصم مش زيادة بناء على المعادلة (salary - raise)
  salaryAfterDiscount?: number; // Virtual field
  createdAt: string;
  updatedAt: string;
}

export interface Trainee {
  _id: string;
  memberId: number;
  name: string;
  phone: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  billingCycleId: string;
  totalCost: number;
  discount: number;
  deleteFlag: boolean;
  accountFreezeStatus: boolean;
  freezeStartDate: string | null;
  freezeHistory: FreezeHistoryEntry[];
  isSession: boolean;
  program: string;
  sessionsRemaining?: number
  usedCoupon?: string

  appliedDiscount: {
    hasCustomDiscount: boolean;
    discountValue: number;
    discountType: 'fixed' | 'percentage';
    expiryDate?: string;
    reason?: string;
  };
  attendanceHistory: Array<{
    checkIn: string;
    _id?: string;
  }>;
  lastAttendance: string | null;
  crmInfo: {
    whatsappOptIn: boolean;
    lastMessageSent?: string;
    lastMessageType?: string;
  };
  daysLeft: number | null;
  createdAt: string;
  updatedAt: string;
  ledgerSummary: LedgerSummary;
}

export interface FreezeHistoryEntry {
  action: 'freeze' | 'unfreeze';
  actorUserId?: string;
  reason: string;
  effectiveDate: string;
  previousEndDate: string;
  resultingEndDate: string;
  createdAt: string;
}

export type PaymentTransactionType = 'payment' | 'refund' | 'adjustment';

export interface PaymentTransaction {
  _id: string;
  traineeId: string;
  billingCycleId: string;
  type: PaymentTransactionType;
  amountMinor: number;
  currency: string;
  status: 'posted' | 'voided';
  reason?: string;
  reference?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerSummary {
  grossPaidMinor: number;
  refundedMinor: number;
  adjustmentsMinor: number;
  netPaidMinor: number;
  outstandingMinor: number;
}


export interface PaginationData {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
export interface TraineeWithPagination {
  trainees: Trainee[];
  pagination: PaginationData;
}

export interface TraineesApiResponse {
  success: boolean;
  error?: string;
  data: Trainee[];
  pagination: PaginationData;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}
// export interface DashboardData {
//   cards: {
//     totalMembers: number;
//     activeMembers: number;
//     expiringSoon: number;
//     attendanceToday: number;
//     totalDebt: number;
//     totalRevenue: number;
//     totalExpenses: number;
//     netProfit: number;
//   };
//   graphs: {
//     attendanceLast7Days: { _id: string; count: number }[];
//     revenueLast6Months: { _id: number; monthName: number; totalRevenue: number; count: number }[];
//   };
// }

// export interface DashboardState {
//   stats: DashboardData | null;
//   loading: boolean;
//   error: string | null;
// }
// export interface DashboardStats {
//   totalTrainees: number;
//   activeTrainees: number;
//   expiredSubscriptions: number;
//   totalRevenue: number;
//   totalExpenses: number;
//   netProfit: number;
// }



export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface TraineesState {
  trainees: Trainee[];
  pagination: PaginationData | null
  loading: boolean;
  error: string | null;
}

export interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

export interface TrainersState {
  trainers: Trainer[];
  loading: boolean;
  error: string | null;
}

export interface CouponsState {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
}
