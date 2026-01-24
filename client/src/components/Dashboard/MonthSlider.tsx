import React from 'react';
import { useTranslation } from 'react-i18next';

interface MonthSliderProps {
    currentDate: Date;
    onChange: (date: Date) => void;
}

const MonthSlider: React.FC<MonthSliderProps> = ({ currentDate, onChange }) => {
    const { t } = useTranslation();
    // Generate last 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return d;
    });

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-4 rounded-2xl mb-8 shadow-2xl">
            <div className="flex justify-between items-end mb-2 px-2">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest">{t('dashboard.timeline_control_label')}</h3>
                <p className="text-white font-bold text-lg">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="relative h-12 flex items-center">
                {/* Track Line */}
                <div className="absolute left-0 right-0 h-1 bg-gray-700 rounded-full z-0"></div>

                {/* Points */}
                <div className="flex justify-between w-full z-10 px-1">
                    {months.map((date, index) => {
                        const isActive = date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
                        return (
                            <button
                                key={index}
                                onClick={() => onChange(date)}
                                className={`group relative flex flex-col items-center focus:outline-none transition-all duration-300 ${isActive ? '-mt-2' : ''}`}
                            >
                                {/* Dot */}
                                <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 
                            ${isActive
                                        ? 'bg-blue-500 border-white scale-150 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                                        : 'bg-gray-800 border-gray-500 group-hover:bg-gray-600'}`}
                                />

                                {/* Label */}
                                <span className={`mt-2 text-xs font-mono transition-colors duration-300 
                            ${isActive ? 'text-blue-400 font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                    {date.toLocaleDateString('en-US', { month: 'short' })}
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