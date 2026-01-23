import React from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface BusinessChartsProps {
    revenueTrend: any[];
    expenseBreakdown: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const BusinessCharts: React.FC<BusinessChartsProps> = ({ revenueTrend, expenseBreakdown }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 1. Profitability Analysis (Composed Chart) */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">💰 Profitability Waterfall</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueTrend}>
                            <defs>
                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" stroke="#9CA3AF" tickFormatter={(val) => `$${val / 1000}k`} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10B981" tickFormatter={(val) => `${val}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                            />
                            <Legend />
                            {/* Revenue Bar */}
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="url(#colorBar)" radius={[4, 4, 0, 0]} barSize={40} />
                            {/* Expense Line */}
                            <Line yAxisId="left" type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                            {/* Margin Line */}
                            <Line yAxisId="right" type="monotone" dataKey="margin" name="Net Margin %" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Expense Allocation (Donut Chart) */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">💸 Where is money going?</h3>
                <div className="h-[350px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={expenseBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {expenseBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#fff' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                        <p className="text-xs text-gray-400">Total Spend</p>
                        <p className="text-xl font-bold text-white">
                            ${expenseBreakdown.reduce((a, b) => a + b.value, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BusinessCharts;