import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface PeakHoursChartProps {
    data: { hour: string; count: number }[];
}

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {t('charts.peak_hours_title')}
                    </h3>
                    <p className="text-xs text-gray-400">{t('charts.peak_hours_subtitle')}</p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorHeat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={2} />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#F59E0B' }}
                            labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#F59E0B"
                            fillOpacity={1}
                            fill="url(#colorHeat)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend / Insight */}
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-xs text-gray-300">
                    {t('charts.operational_tip')}
                </p>
            </div>
        </div>
    );
};

export default PeakHoursChart;