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
import {
    Filter,
    Search,
    Zap,
    UserPlus,
    ChevronDown,
    ChevronUp,
    Calendar,
    DollarSign,
    CreditCard,
    Clock,
    User,
    Snowflake,
    Trash2,
    Edit,
    Activity,
    RefreshCw
} from 'lucide-react';
import RenewModal from './RenewModal';

interface TraineeListProps {
    onEdit: (trainee: Trainee) => void;
    onAddNew: () => void;
}
type FilterType = 'all' | 'active' | 'expired' | 'frozen' | 'debt' | 'session';

const TraineeList: React.FC<TraineeListProps> = ({ onEdit, onAddNew }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { trainees, loading } = useSelector((state: RootState) => state.trainees);
    const { error: showError } = useMessage();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { showConfirm } = useConfirmToast();
    const [checkInTraineeData, setCheckInTraineeData] = useState<{ id: string, name: string } | null>(null);
    const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
    const [renewData, setRenewData] = useState<{ id: string, name: string, isSession: boolean } | null>(null);

    useEffect(() => {
        dispatch(fetchTrainees());
    }, [dispatch]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirm(id, () => {
            dispatch(deleteTrainee(id))
                .unwrap()
                .catch(() => showError(t('trainees.delete_failed')));
        });
    };

    const handleFreeze = (id: string, e: React.MouseEvent) => {
        console.log(id);
        e.stopPropagation();
        showConfirm(id, () => {
            dispatch(freezeTrainee(id))
                .unwrap()
                .catch(() => showError(t('common.error_occurred')));
        });
    }

    const getStatusBadge = (trainee: Trainee) => {
        const endDate = new Date(trainee.subscriptionEndDate);
        const today = new Date();

        if (trainee.accountFreezeStatus) {
            return (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-semibold">
                    <Snowflake className="w-3 h-3" /> {t('trainees.frozen')}
                </span>
            );
        }

        if (endDate < today) {
            return (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-semibold">
                    <Activity className="w-3 h-3" /> {t('trainees.expired')}
                </span>
            );
        }

        if (trainee.remaining > 0) {
            return (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-xs font-semibold">
                    <DollarSign className="w-3 h-3" /> {t('trainees.debt')}
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-semibold">
                <Activity className="w-3 h-3" /> {t('trainees.active')}
            </span>
        );
    };

    // Enhanced Filtering Logic
    const filteredTrainees = trainees.filter((trainee) => {
        const endDate = new Date(trainee.subscriptionEndDate);
        const today = new Date();

        // Search Filter
        const matchesSearch =
            trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainee.phone.includes(searchTerm) ||
            trainee.memberId.toString().includes(searchTerm);

        if (!matchesSearch) return false;

        // Status Filter
        switch (filterStatus) {
            case 'active': return endDate > today && !trainee.accountFreezeStatus;
            case 'expired': return endDate < today;
            case 'frozen': return trainee.accountFreezeStatus;
            case 'debt': return trainee.remaining > 0;
            case 'session': return trainee.isSession;
            default: return true;
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

    const filters: { key: FilterType; label: string, icon: any }[] = [
        { key: 'all', label: 'All', icon: User },
        { key: 'active', label: 'Active', icon: Activity },
        { key: 'frozen', label: 'Frozen', icon: Snowflake },
        { key: 'expired', label: 'Expired', icon: Clock },
        { key: 'debt', label: 'Debt', icon: DollarSign },
        { key: 'session', label: 'Session', icon: Calendar }
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

            {/* 1. Filter & Action Toolbar */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col xl:flex-row gap-4 justify-between">

                {/* Filters */}
                <div className="flex overflow-x-auto pb-2 xl:pb-0 gap-2 no-scrollbar">
                    {filters.map(({ key, label, icon: Icon }) => {
                        const count = getCount(key);
                        const isActive = filterStatus === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {t(`trainees.filter_${key}`) || label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-md ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-500'}`}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search name, phone, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowQuickCheckIn(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-purple-900/20"
                        >
                            <Zap className="w-4 h-4 fill-white" />
                            {t('trainees.quick_check_in', 'Check-in')}
                        </button>
                        <button
                            onClick={onAddNew}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20"
                        >
                            <UserPlus className="w-4 h-4" />
                            {t('trainees.add_new')}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. List Grid */}
            <div className="grid gap-4">
                {filteredTrainees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50 border-dashed">
                        <div className="bg-gray-800 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-lg font-medium">{t('trainees.no_trainees_filter')}</p>
                        <button
                            onClick={() => { setFilterStatus('all'); setSearchTerm(''); }}
                            className="text-blue-400 hover:text-blue-300 text-sm mt-2 hover:underline"
                        >
                            {t('trainees.clear_filters')}
                        </button>
                    </div>
                ) : (
                    filteredTrainees.map((trainee) => (
                        <div
                            key={trainee._id}
                            className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all overflow-hidden group"
                        >
                            {/* Card Header (Always Visible) */}
                            <div
                                className="p-5 cursor-pointer flex justify-between items-center"
                                onClick={() => setExpandedId(expandedId === trainee._id ? null : trainee._id)}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar / ID */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center shadow-inner">
                                        <span className="text-gray-300 font-mono font-bold">#{trainee.memberId}</span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {trainee.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span>{trainee.phone}</span>
                                            {trainee.isSession && (
                                                <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 text-[10px] rounded border border-blue-500/20">SESSION</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:block">
                                        {getStatusBadge(trainee)}
                                    </div>
                                    <div className={`text-gray-500 transition-transform duration-300 ${expandedId === trainee._id ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === trainee._id && (
                                <div className="bg-gray-900/50 p-6 border-t border-gray-700 animate-slideDown">

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Period
                                            </p>
                                            <p className="text-gray-300 text-sm font-medium">
                                                {new Date(trainee.subscriptionStartDate).toLocaleDateString()} -{' '}
                                                {new Date(trainee.subscriptionEndDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Duration
                                            </p>
                                            <p className="text-white font-bold text-lg">
                                                {trainee.daysLeft || 0} <span className="text-xs font-normal text-gray-400">days left</span>
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" /> Financials
                                            </p>
                                            <div className="flex gap-4">
                                                <div className="text-sm">
                                                    <span className="text-gray-400 block text-[10px]">TOTAL</span>
                                                    {trainee.totalCost} EGP
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-400 block text-[10px]">PAID</span>
                                                    <span className="text-green-400">{trainee.paid} EGP</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" /> Balance
                                            </p>
                                            <p className={`font-bold text-lg ${trainee.remaining > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {trainee.remaining} EGP
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions Row */}
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700/50">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(trainee); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-all border border-blue-600/20"
                                        >
                                            <Edit className="w-4 h-4" />
                                            {t('common.edit')}
                                        </button>

                                        <button
                                            onClick={(e) => handleFreeze(trainee._id, e)}
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-600/10 text-yellow-500 hover:bg-yellow-600 hover:text-white rounded-lg text-sm font-semibold transition-all border border-yellow-600/20"
                                        >
                                            <Snowflake className="w-4 h-4" />
                                            {trainee.accountFreezeStatus ? t('common.unfreeze') : t('common.freeze')}
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // بنفتح المودال ونبعتله بيانات المتدرب ده
                                                setRenewData({
                                                    id: trainee._id,
                                                    name: trainee.name,
                                                    isSession: trainee.isSession
                                                });
                                            }}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg text-sm font-semibold transition-all border border-green-600/20"
                                        >
                                            <RefreshCw className="w-4 h-4" /> {/* استورد الايقونة دي */}
                                            {t('common.renew')}
                                        </button>

                                        <button
                                            onClick={(e) => handleDelete(trainee._id, e)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold transition-all border border-red-600/20 ml-auto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t('common.delete')}
                                        </button>

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

            {showQuickCheckIn && (
                <QuickCheckInModal
                    onClose={() => setShowQuickCheckIn(false)}
                />
            )}

            {renewData && (
                <RenewModal
                    traineeId={renewData.id}
                    traineeName={renewData.name}
                    isSession={renewData.isSession}
                    onClose={() => setRenewData(null)}
                />
            )}

        </div>
    );
};

export default TraineeList;