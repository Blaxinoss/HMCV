import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trainee } from '../../types';
import {
  Clock,
  AlertCircle,
  Snowflake,
  ChevronRight,
  Activity,
  Ticket
} from 'lucide-react';

interface TraineeCardProps {
  trainee: Trainee;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

const TraineeCard: React.FC<TraineeCardProps> = ({ trainee, isSelected, onSelect, onViewDetails }) => {
  const { t } = useTranslation();

  // Helper to determine card border/bg styles based on status
  const getStatusStyles = () => {
    if (trainee.accountFreezeStatus)
      return 'border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-transparent hover:border-yellow-500/40';

    if (trainee.remaining > 0)
      return 'border-red-500/20 bg-gradient-to-br from-red-900/10 to-transparent hover:border-red-500/40';

    // Default Active
    return 'border-gray-800 bg-gray-900/50 hover:border-blue-500/40 hover:bg-gray-900';
  };

  // Determine the primary metric (Sessions vs Days)
  const isSession = trainee.isSession;
  const remainingValue = isSession ? (trainee.sessionsRemaining || 0) : (trainee.daysLeft || 0);
  const maxValue = isSession ? (trainee.sessionsRemaining || 12) : 30; // Assuming 30 days or session count as max for progress bar
  const progressPercentage = Math.min(Math.max((remainingValue / maxValue) * 100, 0), 100);

  // Color logic for low balance/time
  const isLow = remainingValue <= (isSession ? 2 : 5);
  const metricColor = isLow ? 'text-red-400' : (isSession ? 'text-blue-400' : 'text-green-400');
  const barColor = isLow ? 'bg-red-500' : (isSession ? 'bg-blue-500' : 'bg-green-500');

  return (
    <div
      onClick={onSelect}
      className={`
        relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 group overflow-hidden
        ${isSelected ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-900/20 transform scale-[1.02] z-10' : 'hover:shadow-lg'}
        ${getStatusStyles()}
      `}
    >
      {/* Selection Indicator Corner */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/20 to-transparent -mr-8 -mt-8 rounded-bl-full pointer-events-none" />
      )}

      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center gap-3">
          {/* Avatar with Gradient */}
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ring-2 ring-opacity-20
             ${trainee.remaining > 0
              ? 'bg-gradient-to-br from-red-500 to-pink-600 ring-red-500 text-white'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-blue-500 text-white'}
          `}>
            {trainee.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white leading-tight truncate w-32 group-hover:text-blue-400 transition-colors">
              {trainee.name}
            </h3>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider">#{trainee.memberId}</span>
          </div>
        </div>

        {/* Status Badge */}
        {trainee.accountFreezeStatus ? (
          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Snowflake className="w-3 h-3" /> Frozen
          </span>
        ) : trainee.remaining > 0 ? (
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse-slow">
            <AlertCircle className="w-3 h-3" /> Debt
          </span>
        ) : (
          <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Activity className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      {/* --- BODY: Metrics --- */}
      <div className="space-y-4 relative z-10">

        {/* Primary Metric (Days or Sessions) */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              {isSession ? <Ticket className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {isSession ? t('trainees.sessions_left', 'Sessions') : t('trainees.days_left', 'Days Left')}
            </span>
            <span className={`text-sm font-bold font-mono ${metricColor}`}>
              {remainingValue} <span className="text-[10px] text-gray-500 font-normal">/ {isSession ? 'Left' : 'Days'}</span>
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Debt Warning (Conditionally Rendered) */}
        {trainee.remaining > 0 && (
          <div className="flex justify-between items-center text-xs bg-red-500/10 border border-red-500/10 px-3 py-2 rounded-lg">
            <span className="text-red-400 font-medium opacity-80">{t('trainees.remaining')}:</span>
            <span className="text-red-400 font-bold font-mono tracking-wide">${trainee.remaining}</span>
          </div>
        )}
      </div>

      {/* --- FOOTER: Action --- */}
      <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-gray-500">
          {isSession ? 'Pay per session' : 'Monthly Plan'}
        </span>
        <button
          className="text-xs font-semibold text-blue-400 hover:text-white flex items-center gap-1 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          {t('common.details')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default TraineeCard;