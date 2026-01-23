// src/components/Trainees/TraineeList.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainees, deleteTrainee, freezeTrainee } from '../../slices/subscriptionSlice';
import { AppDispatch, RootState } from '../../store';
import { Trainee } from '../../types';
import useMessage from '../../utils/useMessageHook';
import { useConfirmToast } from '../toasters/deleteToaster';
import CheckInModal from './CheckInModal';
import QuickCheckInModal from '../Trainers/QuickCheckInModal';

interface TraineeListProps {
    onEdit: (trainee: Trainee) => void;
    onAddNew: () => void;
}
type FilterType = 'all' | 'active' | 'expired' | 'frozen' | 'debt' | 'session';

const TraineeList: React.FC<TraineeListProps> = ({ onEdit, onAddNew }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { trainees, loading, error } = useSelector(
        (state: RootState) => state.trainees
    );
    const { error: showError } = useMessage();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterType>('all');

    const { showConfirm } = useConfirmToast();
    const [checkInTraineeData, setCheckInTraineeData] = useState<{ id: string, name: string } | null>(null);
    const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);

    useEffect(() => {
        dispatch(fetchTrainees());
    }, [dispatch]);

    const handleDelete = (id: string) => {
        showConfirm(id, () => {
            dispatch(deleteTrainee(id))
                .unwrap()
                .catch(() => showError(t('trainees.delete_failed')));
        });
    };

    const handleFreeze = (id: string) => {
        showConfirm(id, () => {
            dispatch(freezeTrainee(id))
                .unwrap() // عشان لو حصل ايرور يمسكه الـ catch
                .then(() => {

                })
                .catch((err) => {
                    showError(t('common.error_occurred'));
                });
        });
    }

    const getStatusBadge = (trainee: Trainee) => {
        const endDate = new Date(trainee.subscriptionEndDate);
        const today = new Date();

        if (trainee.accountFreezeStatus) {
            return <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-semibold">
                {t('trainees.frozen')}
            </span>;
        }

        if (endDate < today) {
            return <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                {t('trainees.expired')}
            </span>;
        }

        if (trainee.remaining > 0) {
            return <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-semibold">
                {t('trainees.debt')}
            </span>;
        }

        return <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
            {t('trainees.active')}
        </span>;
    };

    const filteredTrainees = trainees.filter((trainee) => {
        const endDate = new Date(trainee.subscriptionEndDate);
        const today = new Date();

        switch (filterStatus) {
            case 'active':
                // نشط: التاريخ لسه مخلصش + مش مجمد
                return endDate > today && !trainee.accountFreezeStatus;

            case 'expired':
                // منتهي: التاريخ خلص
                return endDate < today;

            case 'frozen':
                // مجمد فقط
                return trainee.accountFreezeStatus;

            case 'debt':
                // عليه فلوس (أياً كانت حالته)
                return trainee.remaining > 0;

            case 'session':
                // مشتركين الحصص فقط
                return trainee.isSession;

            default: // 'all'
                return true;
        }
    });

    const getCount = (status: FilterType) => {
        if (status === 'all') return trainees.length;
        return trainees.filter((t) => {
            const end = new Date(t.subscriptionEndDate);
            const now = new Date();
            if (status === 'active') return end > now && !t.accountFreezeStatus;
            if (status === 'expired') return end < now;
            if (status === 'frozen') return t.accountFreezeStatus;
            if (status === 'debt') return t.remaining > 0;
            if (status === 'session') return t.isSession;
            return true;
        }).length;
    };

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: 'all' },
        { key: 'active', label: 'active' },
        { key: 'frozen', label: 'frozen' }, // جديد
        { key: 'expired', label: 'expired' },
        { key: 'debt', label: 'debt' },     // جديد
        { key: 'session', label: 'session' } // جديد
    ];


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex flex-wrap gap-2">
                    {filters.map(({ key }) => {
                        const count = getCount(key);
                        const isActive = filterStatus === key;

                        // تلوين الزرار حسب نوعه لو نشط
                        let activeColor = 'bg-blue-600';
                        if (key === 'debt') activeColor = 'bg-red-600';
                        if (key === 'frozen') activeColor = 'bg-yellow-600';
                        if (key === 'active') activeColor = 'bg-green-600';

                        return (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key)}
                                className={`
                                    px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                                    ${isActive
                                        ? `${activeColor} text-white shadow-lg scale-105`
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}
                                `}
                            >
                                {t(`trainees.filter_${key}`)}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20' : 'bg-gray-700 text-gray-300'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    {/* 🔥 زرار تسجيل الحضور السريع */}
                    <button
                        onClick={() => setShowQuickCheckIn(true)}
                        className="flex-1 md:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        <span>⚡</span> {t('trainees.quick_check_in', 'Quick Check-in')}
                    </button>

                    <button
                        onClick={onAddNew}
                        className="flex-1 md:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        <span>+</span> {t('trainees.add_new')}
                    </button>
                </div>



            </div>

            <div className="grid gap-4">
                {filteredTrainees.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700/50 border-dashed">
                        <p className="text-4xl mb-2">🔍</p>
                        <p className="text-gray-400 text-lg">{t('trainees.no_trainees_filter')}</p>
                        <button
                            onClick={() => setFilterStatus('all')}
                            className="text-blue-400 hover:text-blue-300 text-sm mt-2 underline"
                        >
                            {t('trainees.clear_filters')}
                        </button>
                    </div>
                ) : (
                    filteredTrainees.map((trainee) => (
                        <div
                            key={trainee._id}
                            className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
                        >
                            <div
                                className="p-6 cursor-pointer flex justify-between items-center"
                                onClick={() => setExpandedId(expandedId === trainee._id ? null : trainee._id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white">
                                                #{trainee.memberId} - {trainee.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">{trainee.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(trainee)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-gray-400 ml-4">
                                    {expandedId === trainee._id ? '▼' : '▶'}
                                </span>
                            </div>

                            {expandedId === trainee._id && (
                                <div className="bg-gray-700 p-6 border-t border-gray-600">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.subscription_period')}</p>
                                            <p className="text-white font-semibold">
                                                {new Date(trainee.subscriptionStartDate).toLocaleDateString()} -{' '}
                                                {new Date(trainee.subscriptionEndDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.days_left')}</p>
                                            <p className="text-white font-semibold text-lg">{trainee.daysLeft || 0} {t('trainees.days')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.total_cost')}</p>
                                            <p className="text-white font-semibold">${trainee.totalCost}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.paid')}</p>
                                            <p className="text-green-400 font-semibold">${trainee.paid}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.remaining')}</p>
                                            <p className={`font-semibold text-lg ${trainee.remaining > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                ${trainee.remaining}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.discount')}</p>
                                            <p className="text-white font-semibold">${trainee.discount}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.last_attendance')}</p>
                                            <p className="text-white font-semibold">
                                                {trainee.lastAttendance
                                                    ? new Date(trainee.lastAttendance).toLocaleDateString()
                                                    : t('trainees.no_attendance')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('trainees.sessions')}</p>
                                            <p className="text-white font-semibold">{trainee.attendanceHistory.length}</p>
                                        </div>
                                    </div>

                                    {trainee.appliedDiscount.hasCustomDiscount && (
                                        <div className="bg-gray-600 p-4 rounded mb-4">
                                            <p className="text-sm text-gray-300">
                                                {t('trainees.custom_discount')}: {trainee.appliedDiscount.discountValue}
                                                {trainee.appliedDiscount.discountType === 'percentage' ? '%' : '$'}
                                            </p>
                                            {trainee.appliedDiscount.reason && (
                                                <p className="text-sm text-gray-400 mt-1">{t('trainees.reason')}: {trainee.appliedDiscount.reason}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 justify-between">

                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() => onEdit(trainee)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors"
                                            >
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(trainee._id)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition-colors"
                                            >
                                                {t('common.delete')}
                                            </button>
                                            <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded font-semibold transition-colors"
                                                onClick={() => handleFreeze(trainee._id)}
                                            >
                                                {trainee.accountFreezeStatus === true ? t('common.unfreeze') : t('common.freeze')}

                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {checkInTraineeData && (
                <CheckInModal
                    traineeId={checkInTraineeData.id}
                    traineeName={checkInTraineeData.name}
                    onClose={() => setCheckInTraineeData(null)}
                />
            )}

            {/* 2. مودال الحضور السريع */}
            {showQuickCheckIn && (
                <QuickCheckInModal
                    onClose={() => setShowQuickCheckIn(false)}
                />
            )}

        </div>
    );
};

export default TraineeList;
