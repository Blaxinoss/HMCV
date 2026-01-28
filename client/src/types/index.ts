// src/types/index.ts

export interface User {

  _id: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
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
  revenue: number;           // إيراد الشهر المحدد
  expenses: number;          // مصاريف الشهر المحدد
  netProfit: number;         // صافي ربح الشهر
  profitMargin: number;      // نسبة الربح
  activeMembers: number;     // الأعضاء النشطين (ثابت)
  newSignups: number;        // المشتركين الجدد في الشهر المحدد
  salaryRatio: number;       // نسبة الرواتب
  churnRate: number;         // معدل التسرب
  expiringSoon: number;      // هيخلصوا قريب
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
  revenueTrend: TrendPoint[];
  expenseTrend: TrendPoint[];
  attendanceLast7Days: AttendancePoint[];
  peakHours: PeakHourPoint[];
  expensesByCategory: { _id: string; totalExpenses: number }[];
}

export interface TopMember {
  _id: string;
  name: string;
  memberId: number;
  totalCost: number;
  remaining: number;
  isSession: boolean;
  paid: number;
}

export interface DashboardLists {
  topMembers: TopMember[];
  recentTransactions: any[];
}

export interface DashboardData {
  cards: DashboardCards;
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
  totalCost: number;
  paid: number;
  remaining: number;
  discount: number;
  deleteFlag: boolean;
  accountFreezeStatus: boolean;
  freezeStartDate: string | null;
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
  error: string;
  data: Trainee[];
  pagination: PaginationData;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiryDate: Date;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
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
