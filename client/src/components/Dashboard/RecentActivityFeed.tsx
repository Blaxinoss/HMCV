import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Calendar,
    History,
    ChevronRight
} from 'lucide-react';

interface Transaction {
    id: string;
    type: string; // 'INCOME' or 'EXPENSE'
    label: string;
    amount: number;
    date: Date;
    category: string;
}

interface RecentActivityFeedProps {
    transactions: Transaction[];
    onViewAll?: () => void;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ transactions, onViewAll }) => {
    const { t } = useTranslation();

    // Helper for cleaner currency format
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl h-full flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" /> {t('dashboard.recent_cash_flow_title')}
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-800 rounded-lg text-gray-400 border border-gray-700">
                    {t('dashboard.recent_activity_count_suffix')} {transactions.length}
                </span>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {transactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 min-h-[200px]">
                        <History className="w-12 h-12 mb-3 stroke-1" />
                        <p>{t('dashboard.no_recent_transactions')}</p>
                    </div>
                ) : (
                    transactions.map((tx) => {
                        const isIncome = tx.type === 'INCOME';
                        return (
                            <div
                                key={tx.id}
                                className="group flex justify-between items-center p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700 cursor-default"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon Box */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors
                        ${isIncome
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20'
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20'}
                    `}>
                                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>

                                    {/* Text Info */}
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight mb-1">{tx.label}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {tx.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className="uppercase tracking-wider text-[10px] font-medium opacity-80">
                                                {tx.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <span className={`text-sm font-bold font-mono tracking-tight
                      ${isIncome ? 'text-emerald-400' : 'text-white'}
                  `}>
                                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-center">
                <button
                    onClick={onViewAll}
                    className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors group"
                >
                    View Full Ledger
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default RecentActivityFeed;