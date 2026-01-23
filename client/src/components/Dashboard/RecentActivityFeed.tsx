import React from 'react';

interface Transaction {
    id: string;
    type: string;
    label: string;
    amount: number;
    date: Date;
    category: string;
}

interface RecentActivityFeedProps {
    transactions: Transaction[];
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ transactions }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">💳 Recent Cash Flow</h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-gray-700/20 hover:bg-gray-700/40 transition border border-transparent hover:border-gray-600"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg
                ${tx.type === 'INCOME' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                {tx.type === 'INCOME' ? '📥' : '📤'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{tx.label}</p>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs text-gray-400">
                                        {tx.date.toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">
                                        {tx.category}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <span className={`font-mono font-bold ${tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                    </div>
                ))}

                {transactions.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No recent activity</div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-400">
                <span>* Last 10 transactions</span>
                <button className="text-blue-400 hover:text-blue-300">View Full Ledger →</button>
            </div>
        </div>
    );
};

export default RecentActivityFeed;