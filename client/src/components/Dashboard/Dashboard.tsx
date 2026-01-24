// src/components/Dashboard/Dashboard.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTrainees } from '../../slices/subscriptionSlice';
import { fetchTrainers } from '../../slices/trainersSlice';
import { fetchExpenses } from '../../slices/expensesSlice';

// Icons (Lucide React)
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  UserMinus,
  Activity,
  Stethoscope,
  Scale,
  Zap,
  AlertTriangle,
  Rocket,
  Crown,
  Clock,
  ArrowRightLeft
} from 'lucide-react';

// Utils
import {
  calculateMonthlyStats,
  getFinancialHealthColor,
  calculatePeakHours,
  getRecentTransactions
} from '../../utils/businessLogic';

// Components
import MonthSlider from './MonthSlider';
import BusinessCharts from './BusinessCharts';
import StatCard from './StatCards';
import PeakHoursChart from './PeakHoursChart';
import RecentActivityFeed from './RecentActivityFeed';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Data Selectors
  const { trainees } = useSelector((state: RootState) => state.trainees);
  const { trainers } = useSelector((state: RootState) => state.trainers);
  const { expenses } = useSelector((state: RootState) => state.expenses);

  // Memoized Calculations
  const peakHoursData = useMemo(() => calculatePeakHours(trainees), [trainees]);
  const recentTx = useMemo(() => getRecentTransactions(trainees, expenses), [trainees, expenses]);

  useEffect(() => {
    dispatch(fetchTrainees());
    dispatch(fetchTrainers());
    dispatch(fetchExpenses());
  }, [dispatch]);

  // 🔥 INTELLIGENT CALCULATION ENGINE 🔥
  const currentStats = useMemo(() => {
    return calculateMonthlyStats(trainees, expenses, trainers, selectedDate);
  }, [trainees, expenses, trainers, selectedDate]);

  // Generate Trend Data for Charts
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(selectedDate);
      d.setMonth(d.getMonth() - (5 - i));
      const stats = calculateMonthlyStats(trainees, expenses, trainers, d);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: stats.revenue,
        expenses: stats.expenses,
        margin: parseFloat(stats.profitMargin.toFixed(1))
      };
    });
  }, [selectedDate, trainees, expenses, trainers]);

  // Expense Breakdown Logic
  const expenseData = useMemo(() => {
    const salaries = trainers.reduce((sum, t) => sum + (t.salaryAfterDiscount || t.salary), 0);

    const categoryMap: Record<string, number> = {};
    expenses
      .filter(e => {
        const d = new Date(e.dateOfPayment);
        return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      })
      .forEach(e => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
      });

    const data = [
      { name: 'Salaries', value: salaries },
      ...Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] }))
    ];
    return data.filter(d => d.value > 0);
  }, [selectedDate, expenses, trainers]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/20">
          <LayoutDashboard className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            {t('dashboard.intelligence_hub_title', 'Business Intelligence Hub')}
          </h1>
          <p className="text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* 🎚️ THE SLIDER */}
      <MonthSlider currentDate={selectedDate} onChange={setSelectedDate} />

      {/* 📊 KPI CARDS (INTENSIVE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title={t('dashboard.monthly_revenue_title')}
          value={`${currentStats.revenue.toLocaleString()} EGP`}
          subValue={t('dashboard.monthly_revenue_subtitle')}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title={t('dashboard.net_profit_title')}
          value={`${currentStats.netProfit.toLocaleString()} EGP`}
          subValue={`${currentStats.profitMargin.toFixed(1)}${t('dashboard.margin_suffix')}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={currentStats.netProfit >= 0 ? 'green' : 'red'}
        />
        <StatCard
          title={t('dashboard.arpu_title')}
          value={`${currentStats.arpu.toFixed(1)} EGP`}
          subValue={t('dashboard.arpu_subtitle')}
          icon={<CreditCard className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title={t('dashboard.active_members_title')}
          value={currentStats.activeUsers}
          subValue={`${currentStats.newSignups} ${t('dashboard.new_this_month_prefix')}`}
          icon={<Users className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title={t('dashboard.churn_rate_title')}
          value={`${currentStats.churnRate.toFixed(1)}%`}
          subValue={t('dashboard.churn_rate_subtitle')}
          icon={<UserMinus className="w-6 h-6" />}
          color={currentStats.churnRate > 10 ? 'red' : 'green'}
        />
      </div>

      {/* 🚀 NEW SECTION: OPERATIONAL & FINANCIAL PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn delay-150">

        {/* 1. Peak Hours (2/3 width) */}
        <div className="lg:col-span-2 h-[400px] relative group">
          {/* Section Title Overlay */}
          <div className="absolute top-4 right-6 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <PeakHoursChart data={peakHoursData} />
        </div>

        {/* 2. Recent Transactions (1/3 width) */}
        <div className="h-[400px] relative group">
          <div className="absolute top-4 right-6 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
          </div>
          <RecentActivityFeed transactions={recentTx} />
        </div>
      </div>

      {/* 📉 DEEP DIVE CHARTS */}
      <div className="mb-8">
        <BusinessCharts revenueTrend={trendData} expenseBreakdown={expenseData} />
      </div>

      {/* 🧠 INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Financial Health Check */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute -top-6 -right-6 p-4 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">
            <Activity className="w-48 h-48 text-blue-400" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">{t('dashboard.financial_health_title')}</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> {t('dashboard.profit_margin')}
              </span>
              <span className={`text-xl font-bold ${getFinancialHealthColor(currentStats.profitMargin)}`}>
                {currentStats.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-gray-400 flex items-center gap-2">
                <Scale className="w-4 h-4" /> {t('dashboard.salary_ratio')}
              </span>
              <span className="text-white font-bold">
                {currentStats.revenue > 0
                  ? ((trainers.reduce((a, b) => a + (b.salaryAfterDiscount || b.salary), 0) / currentStats.revenue) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="mt-4 p-3 bg-blue-900/10 rounded-lg border border-blue-500/10">
              <p className="text-xs text-blue-400 uppercase font-bold mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {t('dashboard.ai_recommendation')}
              </p>
              <p className="text-sm text-gray-300 italic">
                {currentStats.profitMargin < 10
                  ? t('dashboard.tight_margins_message')
                  : t('dashboard.healthy_margins_message')}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Customer LTV & Segments */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">{t('dashboard.high_value_members')}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700 text-sm">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Plan Type</th>
                  <th className="p-3 font-medium">Total Spend</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trainees
                  .slice()
                  .sort((a, b) => b.totalCost - a.totalCost)
                  .slice(0, 4)
                  .map(t => (
                    <tr key={t._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition last:border-0">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white">
                          {t.name.charAt(0)}
                        </div>
                        {t.name}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs border ${t.isSession ? 'bg-purple-900/20 border-purple-500/30 text-purple-300' : 'bg-blue-900/20 border-blue-500/30 text-blue-300'}`}>
                          {t.isSession ? 'Session Pack' : 'Monthly Sub'}
                        </span>
                      </td>
                      <td className="p-3 text-green-400 font-mono font-bold">{t.totalCost.toLocaleString()} EGP</td>
                      <td className="p-3">
                        {t.remaining > 0
                          ? <span className="text-red-400 text-xs font-semibold bg-red-900/20 px-2 py-1 rounded">Owes {t.remaining} EGP</span>
                          : <span className="text-green-500 text-xs font-semibold bg-green-900/20 px-2 py-1 rounded">Paid</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 🔥 NEW: ACTION CENTER WIDGET 🔥 */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/30 p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>

          <div className="flex items-center gap-2 mb-6 relative z-10">
            <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <h3 className="text-xl font-bold text-white">Action Center</h3>
          </div>

          <div className="space-y-3 relative z-10">
            {/* Smart Alert 1 */}
            {currentStats.profitMargin < 15 && (
              <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex gap-3 items-start backdrop-blur-sm">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Low Margins Alert</p>
                  <p className="text-xs text-gray-300">Expenses are eating {100 - parseInt(currentStats.profitMargin.toFixed(0))}% of revenue.</p>
                </div>
              </div>
            )}

            {/* Smart Alert 2 */}
            {currentStats.churnRate > 5 && (
              <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg flex gap-3 items-start backdrop-blur-sm">
                <TrendingDown className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Churn Risk</p>
                  <p className="text-xs text-gray-300">Retention dropped this month. Contact expired members.</p>
                </div>
              </div>
            )}

            {/* Positive Reinforcement */}
            {currentStats.newSignups > 5 && (
              <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg flex gap-3 items-start backdrop-blur-sm">
                <Rocket className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Momentum!</p>
                  <p className="text-xs text-gray-300">{currentStats.newSignups} new members joined. Keep it up!</p>
                </div>
              </div>
            )}

            {/* Default State if no alerts */}
            {currentStats.profitMargin >= 15 && currentStats.churnRate <= 5 && currentStats.newSignups <= 5 && (
              <div className="bg-gray-800/50 border border-gray-700 p-3 rounded-lg flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-sm text-gray-400">System is running smoothly. No critical actions needed.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;