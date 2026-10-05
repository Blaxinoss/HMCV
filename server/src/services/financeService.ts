import mongoose, { type Model } from 'mongoose';
import type {
    IPaymentTransaction,
    PaymentTransactionType,
} from '../models/PaymentTransaction.js';
import {
    calculateLedgerSummary,
    type LedgerSummary,
    type LedgerTransaction,
} from '../utils/finance.js';

interface TraineePriceSource {
    totalCost: number;
    discount?: number;
}

interface TraineeLedgerIdentity extends TraineePriceSource {
    _id: mongoose.Types.ObjectId;
    billingCycleId: string;
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

    return calculateLedgerSummary(
        netPriceMinor,
        transactions.map(transaction => ({
            type: transaction.type,
            amountMinor: transaction.amountMinor,
            status: transaction.status,
        })),
    );
}

export async function getLedgerSummaryMap(
    transactionModel: Model<IPaymentTransaction>,
    trainees: TraineeLedgerIdentity[],
): Promise<Map<string, LedgerSummary>> {
    const summaries = new Map<string, LedgerSummary>();
    if (trainees.length === 0) return summaries;

    const transactions = await transactionModel.find({
        status: 'posted',
        $or: trainees.map(trainee => ({
            traineeId: trainee._id,
            billingCycleId: trainee.billingCycleId,
        })),
    }).lean();

    const transactionsByTrainee = new Map<string, LedgerTransaction[]>();
    for (const transaction of transactions) {
        const key = String(transaction.traineeId);
        const current = transactionsByTrainee.get(key) ?? [];
        current.push({
            type: transaction.type,
            amountMinor: transaction.amountMinor,
            status: transaction.status,
        });
        transactionsByTrainee.set(key, current);
    }

    for (const trainee of trainees) {
        const key = String(trainee._id);
        summaries.set(key, calculateLedgerSummary(
            getNetPriceMinor(trainee),
            transactionsByTrainee.get(key) ?? [],
        ));
    }

    return summaries;
}
