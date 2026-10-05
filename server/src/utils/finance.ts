export type LedgerTransactionType = 'payment' | 'refund' | 'adjustment';

export interface LedgerTransaction {
    type: LedgerTransactionType;
    amountMinor: number;
    status?: 'posted' | 'voided';
}

export interface LedgerSummary {
    grossPaidMinor: number;
    refundedMinor: number;
    adjustmentsMinor: number;
    netPaidMinor: number;
    outstandingMinor: number;
}

export function calculateLedgerSummary(
    netPriceMinor: number,
    transactions: LedgerTransaction[],
): LedgerSummary {
    if (!Number.isInteger(netPriceMinor) || netPriceMinor < 0) {
        throw new Error('netPriceMinor must be a non-negative integer');
    }

    const posted = transactions.filter((transaction) => transaction.status !== 'voided');
    const grossPaidMinor = sumByType(posted, 'payment');
    const refundedMinor = sumByType(posted, 'refund');
    const adjustmentsMinor = sumByType(posted, 'adjustment');
    const netPaidMinor = grossPaidMinor - refundedMinor + adjustmentsMinor;

    if (netPaidMinor < 0) {
        throw new Error('Ledger cannot produce a negative net paid balance');
    }

    return {
        grossPaidMinor,
        refundedMinor,
        adjustmentsMinor,
        netPaidMinor,
        outstandingMinor: Math.max(0, netPriceMinor - netPaidMinor),
    };
}

function sumByType(
    transactions: LedgerTransaction[],
    type: LedgerTransactionType,
): number {
    return transactions
        .filter((transaction) => transaction.type === type)
        .reduce((total, transaction) => {
            if (!Number.isInteger(transaction.amountMinor) || transaction.amountMinor < 0) {
                throw new Error('Transaction amounts must be non-negative integers');
            }
            return total + transaction.amountMinor;
        }, 0);
}
