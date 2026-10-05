import mongoose, { type Model } from 'mongoose';
import type {
    IPaymentTransaction,
    PaymentTransactionType,
} from '../models/PaymentTransaction.js';
import { calculateLedgerSummary, type LedgerTransaction } from '../utils/finance.js';

interface TraineePriceSource {
    totalCost: number;
    discount?: number;
}

export function toMinorUnits(amount: number): number {
    if (!Number.isFinite(amount) || amount < 0) {
        throw new Error('Amount must be a non-negative finite number');
    }
    return Math.round(amount * 100);
}

export function getNetPriceMinor(trainee: TraineePriceSource): number {
    return toMinorUnits(Math.max(0, trainee.totalCost - (trainee.discount ?? 0)));
}

export async function createTransaction({
    transactionModel,
    traineeId,
    billingCycleId,
    type,
    amountMinor,
    reason,
    reference,
    createdBy,
    session,
}: {
    transactionModel: Model<IPaymentTransaction>;
    traineeId: mongoose.Types.ObjectId;
    billingCycleId: string;
    type: PaymentTransactionType;
    amountMinor: number;
    reason?: string;
    reference?: string;
    createdBy?: mongoose.Types.ObjectId;
    session?: mongoose.ClientSession;
}) {
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        throw new Error('amountMinor must be a positive integer');
    }

    const [transaction] = await transactionModel.create(
        [{ traineeId, billingCycleId, type, amountMinor, reason, reference, createdBy }],
        session ? { session } : undefined,
    );

    return transaction;
}

export async function getLedgerSummary(
    transactionModel: Model<IPaymentTransaction>,
    traineeId: mongoose.Types.ObjectId,
    billingCycleId: string,
    netPriceMinor: number,
    session?: mongoose.ClientSession,
) {
    const query = transactionModel.find({ traineeId, billingCycleId, status: 'posted' });
    if (session) query.session(session);
    const transactions = await query.lean();

    const ledgerTransactions: LedgerTransaction[] = transactions.map((transaction) => ({
        type: transaction.type,
        amountMinor: transaction.amountMinor,
        status: transaction.status,
    }));

    return calculateLedgerSummary(netPriceMinor, ledgerTransactions);
}
