import React, { useEffect, useState } from 'react';
import { Clock3, Loader2, ReceiptText } from 'lucide-react';
import api from '../../utils/api';
import { LedgerSummary, PaymentTransaction } from '../../types';

interface TransactionHistoryProps {
  traineeId: string;
}

const formatAmount = (amountMinor: number, currency: string) =>
  `${(amountMinor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ traineeId }) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<{
          success: boolean;
          data: { transactions: PaymentTransaction[]; summary: LedgerSummary };
        }>(`/trainees/${traineeId}/transactions`);
        if (!active) return;
        setTransactions(response.data.data.transactions);
        setSummary(response.data.data.summary);
      } catch (requestError: any) {
        if (active) {
          setError(requestError.message || 'Unable to load financial history');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      active = false;
    };
  }, [traineeId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading financial history...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <span className="block text-[10px] uppercase text-gray-500">Net collected</span>
          <strong className="text-green-400">{((summary?.netPaidMinor || 0) / 100).toLocaleString()} EGP</strong>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <span className="block text-[10px] uppercase text-gray-500">Outstanding</span>
          <strong className="text-red-400">{((summary?.outstandingMinor || 0) / 100).toLocaleString()} EGP</strong>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <span className="block text-[10px] uppercase text-gray-500">Refunded</span>
          <strong className="text-yellow-400">{((summary?.refundedMinor || 0) / 100).toLocaleString()} EGP</strong>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <span className="block text-[10px] uppercase text-gray-500">Entries</span>
          <strong className="text-white">{transactions.length}</strong>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No ledger transactions recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="flex items-center justify-between gap-3 bg-gray-800/60 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <ReceiptText className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-200 capitalize truncate">{transaction.type}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock3 className="w-3 h-3" /> {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={transaction.type === 'refund' ? 'text-yellow-400' : 'text-green-400'}>
                {transaction.type === 'refund' ? '-' : '+'}{formatAmount(transaction.amountMinor, transaction.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
