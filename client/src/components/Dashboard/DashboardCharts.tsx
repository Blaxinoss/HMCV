// src/components/Dashboard/DashboardCharts.tsx
import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { DashboardData } from '../../types';

interface ChartsProps {
    data: DashboardData['graphs'];
}

const DashboardCharts: React.FC<ChartsProps> = ({ data }) => {
    // Format revenue dates
    const revenueData = data.revenueLast6Months.map(item => {
        const date = new Date();
        date.setMonth(item._id - 1);
        return {
            ...item,
            name: date.toLocaleString('en-US', { month: 'short' })
        };
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Revenue Chart (Area) */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    📈 Revenue Growth <span className="text-xs text-gray-500">(Last 6 Months)</span>
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ color: '#10B981' }}
                                formatter={(value: number | undefined) => value ? [`$${value.toLocaleString()}`, 'Revenue'] : ['N/A', 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalRevenue"
                                stroke="#10B981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Attendance Chart (Bar) */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    🏋️ Gym Traffic <span className="text-xs text-gray-500">(Last 7 Days)</span>
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.attendanceLast7Days}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="_id"
                                stroke="#9CA3AF"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#374151', opacity: 0.4 }}
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {data.attendanceLast7Days.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === data.attendanceLast7Days.length - 1 ? '#3B82F6' : '#4B5563'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;