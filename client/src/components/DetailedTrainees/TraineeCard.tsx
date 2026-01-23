import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trainee } from '../../types'; // تأكد من المسار

interface TraineeCardProps {
  trainee: Trainee;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

const TraineeCard: React.FC<TraineeCardProps> = ({ trainee, isSelected, onSelect, onViewDetails }) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    if (trainee.accountFreezeStatus) return 'border-yellow-500/50 bg-yellow-900/10';
    if (trainee.remaining > 0) return 'border-red-500/50 bg-red-900/10';
    return 'border-gray-700 bg-gray-800';
  };

  return (
    <div
      onClick={onSelect}
      className={`
        relative rounded-xl border p-5 cursor-pointer transition-all duration-300
        ${isSelected ? 'ring-2 ring-blue-500 transform scale-[1.02]' : 'hover:border-gray-500'}
        ${getStatusColor()}
      `}
    >
      {/* Header: Name & Status */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{trainee.name}</h3>
          <p className="text-sm text-gray-400">{trainee.phone}</p>
        </div>
        {trainee.remaining > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {t('common.debt', 'مديون')}
          </span>
        )}
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>{t('trainees.subscription')}:</span>
          <span className={trainee.daysLeft && trainee.daysLeft < 5 ? "text-red-400" : "text-green-400"}>
            {trainee.daysLeft} {t('common.days')}
          </span>
        </div>

        <div className="flex justify-between">
          <span>{t('trainees.fees')}:</span>
          <span>{trainee.totalCost} EGP</span>
        </div>

        {trainee.remaining > 0 && (
          <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
            <span className="text-red-400 font-bold">{t('trainees.remaining')}:</span>
            <span className="text-red-400 font-bold">{trainee.remaining} EGP</span>
          </div>
        )}
      </div>

      {/* Expanded Actions (Optional - يظهر لما تدوس) */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-gray-600 flex justify-end gap-2">
          <button className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails();
            }}>
            {t('common.details')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TraineeCard;