import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  AlertTriangle,
  Clock,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Scale,
  Snowflake,
  TrendingDown,
  TrendingUp,
  UserMinus,
  Users,
  Zap,
} from "lucide-react";
import { AppDispatch, RootState } from "../../store";
import { fetchDashboardStats } from "../../slices/dashboardSlice";
import MonthSlider from "./MonthSlider";
import BusinessCharts from "./BusinessCharts";
import StatCard from "./StatCards";
import PeakHoursChart from "./PeakHoursChart";
import RecentActivityFeed from "./RecentActivityFeed";
import { currentGymMonth, formatGymDate } from "../../utils/dateTime";
import { formatCurrency, formatNumber } from "../../utils/format";

const financialHealthColor = (margin: number) => {
  if (margin >= 30) return "text-green-400";
  if (margin >= 10) return "text-blue-400";
  if (margin >= 0) return "text-yellow-400";
  return "text-red-500";
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMonth, setSelectedMonth] = useState(currentGymMonth);
  const { stats, loading, error, needsRefresh } = useSelector(
    (state: RootState) => state.dashboard,
  );

  useEffect(() => {
    if (!stats || stats.meta.selectedMonth !== selectedMonth || needsRefresh) {
      dispatch(fetchDashboardStats({ month: selectedMonth }));
    }
  }, [dispatch, selectedMonth, stats, needsRefresh]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center p-8">
        {error || t("ui.dashboard_unavailable")}
      </div>
    );
  }

  const { cards, financials, graphs, lists } = stats;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 lg:p-8 font-sans">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/20">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              {t(
                "dashboard.intelligence_hub_title",
                "Business Intelligence Hub",
              )}
            </h1>
            <p className="text-gray-400 mt-1">
              {t("dashboard.subtitle", "Overview & Analytics")} ·{" "}
              {stats.meta.timezone}
            </p>
          </div>
        </div>
        {loading && (
          <span className="text-xs text-blue-400 animate-pulse">
            {t("ui.refreshing")}
          </span>
        )}
      </div>

      <MonthSlider currentMonth={selectedMonth} onChange={setSelectedMonth} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("dashboard.monthly_revenue_title")}
          value={formatCurrency(financials.netRevenue)}
          subValue={t("ui.paid_refunded", {
            paid: formatCurrency(financials.payments),
            refunded: formatCurrency(financials.refunds),
          })}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title={t("dashboard.net_profit_title")}
          value={formatCurrency(financials.netProfit)}
          subValue={`${financials.profitMargin.toFixed(1)}${t("dashboard.margin_suffix")}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={financials.netProfit >= 0 ? "green" : "red"}
        />
        <StatCard
          title={t("dashboard.expenses")}
          value={formatCurrency(financials.totalExpenses)}
          subValue={t("ui.actual_payroll", {
            actual: formatCurrency(financials.operatingExpenses),
            payroll: formatCurrency(financials.estimatedTrainerPayroll),
          })}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title={t("dashboard.active_members_title")}
          value={cards.activeMembers}
          subValue={`${cards.newMembers} ${t("dashboard.new_this_month_prefix")}`}
          icon={<Users className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title={t("ui.current_debt")}
          value={formatCurrency(cards.currentDebt)}
          subValue={t("ui.members_with_debt", { count: cards.membersWithDebt })}
          icon={<CreditCard className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title={t("ui.frozen_members")}
          value={cards.frozenMembers}
          subValue={t("ui.expired_count", { count: cards.expiredMembers })}
          icon={<Snowflake className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title={t("ui.expiring_soon")}
          value={cards.expiringSoon}
          subValue={t("ui.within_next_days", { count: 5 })}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title={t("ui.attendance_today")}
          value={cards.attendanceToday}
          subValue={t("ui.session_members_count", { count: cards.sessionMembers })}
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 h-[400px] relative">
          <Clock className="absolute top-4 right-6 z-10 w-5 h-5 text-gray-400" />
          <PeakHoursChart data={graphs.peakHours} />
        </div>
        <div className="h-[400px]">
          <RecentActivityFeed transactions={stats.lists.recentActivity} />
        </div>
      </div>

      <div className="mb-8">
        <BusinessCharts
          revenueTrend={graphs.financialTrendLast6Months}
          expenseBreakdown={graphs.expenseBreakdown}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" /> {t("ui.financial_health")}
          </h3>
          <div className="space-y-3">
            <Metric
              label={t("dashboard.profit_margin")}
              value={`${financials.profitMargin.toFixed(1)}%`}
              valueClass={financialHealthColor(financials.profitMargin)}
            />
            <Metric
              label={t("ui.estimated_salary_ratio")}
              value={`${financials.salaryRatio.toFixed(1)}%`}
            />
            <Metric label={t("ui.arpu")} value={formatCurrency(financials.arpu)} />
            <Metric
              label={t("ui.lifetime_net_revenue")}
              value={formatCurrency(financials.lifetimeNetRevenue)}
            />
            <p className="text-xs text-gray-500 pt-2">
              {t("ui.payroll_estimate_note")}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-6">
            {t("ui.high_value_members_actual")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700">
                  <th className="p-3">{t("ui.name")}</th>
                  <th className="p-3">{t("ui.plan")}</th>
                  <th className="p-3">{t("ui.lifetime_spend")}</th>
                  <th className="p-3">{t("ui.current_balance")}</th>
                </tr>
              </thead>
              <tbody>
                {lists.topMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b border-gray-800 last:border-0"
                  >
                    <td className="p-3 font-semibold">{member.name}</td>
                    <td className="p-3 text-gray-400">
                      {member.isSession ? t("ui.session_pack") : t("ui.monthly")}
                    </td>
                    <td className="p-3 text-green-400 font-mono">
                      {formatCurrency(member.lifetimeSpend)}
                    </td>
                    <td
                      className={`p-3 font-mono ${member.outstandingBalance > 0 ? "text-red-400" : "text-green-500"}`}
                    >
                      {member.outstandingBalance > 0
                        ? formatCurrency(member.outstandingBalance)
                        : t("ui.settled")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> {t("ui.expiring_next_days", { count: 5 })}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {lists.expiringMembers.length === 0 && (
              <p className="text-gray-500">{t("ui.no_expiring_members")}</p>
            )}
            {lists.expiringMembers.map((member) => (
              <div
                key={member._id}
                className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 flex justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-gray-500">
                    #{member.memberId || "—"} · {member.phone}
                  </p>
                </div>
                <span className="text-sm text-orange-400">
                  {formatGymDate(member.subscriptionEndDate)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserMinus className="w-5 h-5" /> {t("ui.period_pulse")}
          </h3>
          <div className="space-y-3">
            <Metric
              label={t("ui.active_during_period")}
              value={formatNumber(financials.activeInPeriod)}
            />
            <Metric
              label={t("ui.expirations")}
              value={formatNumber(cards.expirationsInPeriod)}
            />
            <Metric
              label={t("ui.expiration_rate")}
              value={`${financials.expirationRate.toFixed(1)}%`}
            />
            <Metric
              label={t("ui.adjustments")}
              value={formatCurrency(financials.adjustments)}
            />
            <Metric
              label={t("ui.monthly_session")}
              value={`${cards.monthlyMembers} / ${cards.sessionMembers}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
    <span className="text-gray-400 flex items-center gap-2">
      <Scale className="w-4 h-4" />
      {label}
    </span>
    <span className={`font-bold ${valueClass}`}>{value}</span>
  </div>
);

export default Dashboard;
