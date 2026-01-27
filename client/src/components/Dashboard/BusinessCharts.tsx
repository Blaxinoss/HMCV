import { Coins, Lock } from 'lucide-react'; // ضفنا Lock icon
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface BusinessChartsProps {
    revenueTrend: any[];
    expenseBreakdown: any[];
    isPremium?: boolean; // ضفنا بروب عشان نتحكم في الحالة
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const BusinessCharts: React.FC<BusinessChartsProps> = ({ revenueTrend, expenseBreakdown, isPremium = false }) => {
    const { t } = useTranslation();

    return (
        <div className="relative"> {/* حاوية رئيسية للتحكم في الطبقة */}

            {/* 1. الطبقة المغطية (تظهر فقط لو مش بريميوم) */}
            {!isPremium && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-[10px] rounded-2xl border-2 border-dashed border-yellow-600/30 transition-all duration-500 group">
                    <div className="bg-gray-900/90 p-6 rounded-2xl shadow-2xl text-center border border-yellow-500/50 transform group-hover:scale-105 transition-transform">
                        <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h4 className="text-yellow-500 font-bold text-lg mb-1 uppercase tracking-widest">
                            {t('Premium Analytics')}
                        </h4>

                    </div>
                </div>
            )}

            {/* 2. محتوى الـ Charts (بيكون blurry لو مش بريميوم) */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${!isPremium ? 'select-none' : ''}`}>

                {/* Profitability Analysis */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">{t('charts.profitability_waterfall_title')}</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={revenueTrend}>
                                <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis yAxisId="left" stroke="#9CA3AF" />
                                <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                                {/* بنخفي الـ Tooltip لو مش بريميوم عشان ميبانش داتا عند الماوس */}
                                {isPremium && <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />}
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" opacity={isPremium ? 1 : 0.4} />
                                <Line yAxisId="left" type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
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
                                    data={expenseBreakdown}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={isPremium ? 1 : 0.4} />
                                    ))}
                                </Pie>
                                {isPremium && <Tooltip />}
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center">
                            <p className="text-xs text-gray-400">{t('charts.total_spend_label')}</p>
                            <p className="text-xl font-bold text-white">**** EGP</p> {/* إخفاء الرقم الإجمالي */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessCharts;