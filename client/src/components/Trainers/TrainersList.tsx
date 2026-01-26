import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteTrainer } from '../../slices/trainersSlice';
import { AppDispatch } from '../../store';
import { Trainer } from '../../types';
import { useConfirmToast } from '../toasters/deleteToaster';
import { Edit, Trash2, Phone, DollarSign } from 'lucide-react';

interface TrainersListProps {
    trainers: Trainer[];
    loading: boolean;
    onEdit: (trainer: Trainer) => void;
}

const TrainersList: React.FC<TrainersListProps> = ({ trainers, loading, onEdit }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { showConfirm } = useConfirmToast();

    const handleDelete = (id: string) => {
        showConfirm(id, () => {
            dispatch(deleteTrainer(id));
        });
    };



    if (trainers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50 border-dashed">
                <div className="text-6xl mb-4 grayscale opacity-50">🏋️‍♂️</div>
                <p className="text-gray-400 text-lg font-medium">{t('trainers.no_trainers', 'No trainers found.')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
                <div
                    key={trainer._id}
                    className="relative bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-xl group overflow-hidden"
                >
                    {/* Decorative Gradient BG */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>

                    {/* Header */}
                    <div className="p-6 pb-4 flex items-center gap-4 border-b border-gray-800">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {trainer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                {trainer.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{trainer.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Salary Grid */}
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> {t('trainers.base_salary')}
                            </span>
                            <span className="text-white font-medium">{trainer.salary.toLocaleString()} EGP</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{t('trainers.deduction')}  </span>
                            <span className={`font-medium ${trainer.raise > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                                - {trainer.raise.toLocaleString()} EGP
                            </span>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t('trainers.net_salary')}</span>
                            <span className="text-2xl font-bold text-green-400 font-mono">
                                {(trainer.salaryAfterDiscount ?? (trainer.salary - trainer.raise)).toLocaleString()}EGP
                            </span>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="px-6 py-4 bg-gray-800/50 flex gap-3">
                        <button
                            onClick={() => onEdit(trainer)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-all border border-blue-600/20"
                        >
                            <Edit className="w-4 h-4" />
                            {t('common.edit')}
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleDelete(trainer._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold transition-all border border-red-600/20"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainersList;