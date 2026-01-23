import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteTrainer } from '../../slices/trainersSlice';
import { AppDispatch } from '../../store';
import { Trainer } from '../../types';
import { useConfirmToast } from '../toasters/deleteToaster'; // الهوك اللي عملناه للحذف

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (trainers.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <p className="text-6xl mb-4">🏋️‍♂️</p>
                <p className="text-gray-400 text-lg">{t('trainers.no_trainers', 'No trainers found.')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {trainers.map((trainer) => (

                <div
                    key={trainer._id}
                    className="relative bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg group"
                >

                    <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br bg-slate-100 opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20`}></div>

                    {/* Header */}
                    <div className="p-5 border-b border-gray-700 flex justify-between items-start">

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-xl font-bold">
                                {trainer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {trainer.name}
                                </h3>
                                <p className="text-sm text-gray-400 font-mono">{trainer.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Salary Details */}
                    <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{t('trainers.base_salary', 'Base Salary')}</span>
                            <span className="text-white font-semibold">${trainer.salary}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{t('trainers.deduction', 'Deduction/Raise')}</span>
                            <span className={`font-semibold ${trainer.raise > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                - ${trainer.raise}
                            </span>
                        </div>

                        <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-gray-300 font-medium">{t('trainers.net_salary', 'Net Salary')}</span>
                            <span className="text-xl font-bold text-green-400">
                                ${trainer.salaryAfterDiscount ?? (trainer.salary - trainer.raise)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-700/30 rounded-b-xl flex gap-2 justify-end">
                        <button
                            onClick={() => onEdit(trainer)}
                            className="px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-all"
                        >
                            {t('common.edit')}
                        </button>
                        <button
                            onClick={() => handleDelete(trainer._id)}
                            className="px-4 py-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold transition-all"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainersList;