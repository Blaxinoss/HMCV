import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatGymMonth, recentGymMonths } from '../../utils/dateTime';

interface MonthSliderProps {
    currentMonth: string;
    onChange: (month: string) => void;
}

const MonthSlider: React.FC<MonthSliderProps> = ({ currentMonth, onChange }) => {
    const { t, i18n } = useTranslation();
    const months = recentGymMonths(12);

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-4 rounded-2xl mb-8 shadow-2xl">
            <div className="flex justify-between items-end mb-2 px-2">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest">{t('dashboard.timeline_control_label')}</h3>
                <p className="text-white font-bold text-lg">{formatGymMonth(currentMonth, i18n.language)}</p>
            </div>
            <div className="relative h-12 flex items-center">
                <div className="absolute left-0 right-0 h-1 bg-gray-700 rounded-full z-0" />
                <div className="flex justify-between w-full z-10 px-1">
                    {months.map(month => {
                        const isActive = month === currentMonth;
                        return (
                            <button key={month} onClick={() => onChange(month)}
                                className={`group relative flex flex-col items-center focus:outline-none transition-all duration-300 ${isActive ? '-mt-2' : ''}`}>
                                <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isActive
                                    ? 'bg-blue-500 border-white scale-150 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                                    : 'bg-gray-800 border-gray-500 group-hover:bg-gray-600'}`} />
                                <span className={`mt-2 text-xs font-mono transition-colors duration-300 ${isActive
                                    ? 'text-blue-400 font-bold'
                                    : 'text-gray-500 group-hover:text-gray-300'}`}>
                                    {formatGymMonth(month, i18n.language, true)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MonthSlider;
