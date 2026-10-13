import { Coins } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import DemoFeatureGate from '../Wrappers/DemoFeatureGate';
import { formatCurrency } from '../../utils/format';
import { formatGymMonth } from '../../utils/dateTime';

interface BusinessChartsProps {
    revenueTrend: any[];
    expenseBreakdown: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const BusinessCharts: React.FC<BusinessChartsProps> = ({ revenueTrend, expenseBreakdown }) => {
    const { t, i18n } = useTranslation();
    const localizedRevenueTrend = revenueTrend.map((month) => ({
        ...month,
        label: formatGymMonth(month.month, i18n.language),
    }));
    const localizedExpenseBreakdown = expenseBreakdown.map((expense) => ({
        ...expense,
        name: expense.estimated
            ? t('ui.estimated_trainer_payroll')
            : t(`expense_categories.${String(expense.name).toLowerCase()}`),
    }));
    const totalSpend = expenseBreakdown.reduce(
        (total, expense) => total + (Number(expense.value) || 0),
        0,
    );

    return (
      <DemoFeatureGate label={t('ui.financial_charts_feature')}>
        <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Profitability Analysis */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">{t('charts.profitability_waterfall_title')}</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={localizedRevenueTrend}>
                                <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" stroke="#9CA3AF" />
                                <YAxis yAxisId="left" stroke="#9CA3AF" />
                                <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" name={t('charts.revenue_label')} fill="#3B82F6" />
                                <Line yAxisId="left" type="monotone" dataKey="expenses" name={t('charts.expenses_label')} stroke="#EF4444" strokeWidth={3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Allocation */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        {t('charts.expense_breakdown_title')}
                    </h3>
                    <div className="h-[350px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={localizedExpenseBreakdown}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {localizedExpenseBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center">
                            <p className="text-xs text-gray-400">{t('charts.total_spend_label')}</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(totalSpend)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </DemoFeatureGate>
    );
};

export default BusinessCharts;
