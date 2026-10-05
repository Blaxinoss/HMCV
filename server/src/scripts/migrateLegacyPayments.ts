import 'dotenv/config';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';

import {
    PaymentTransactionSchema,
    type IPaymentTransaction,
} from '../models/PaymentTransaction.js';
import { calculateLedgerSummary } from '../utils/finance.js';
import { getNetPriceMinor, toMinorUnits } from '../services/financeService.js';
import dns from 'dns';
dns.setServers(["8.8.8.8"]);
const uri = process.env.DB_URI;
const tenantId = process.env.MIGRATION_TENANT_ID;
const applyChanges = process.argv.includes('--apply');

if (!uri) throw new Error('DB_URI is not defined');
if (!tenantId) throw new Error('MIGRATION_TENANT_ID is required');
if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    throw new Error('MIGRATION_TENANT_ID may contain only letters, numbers, underscores, and hyphens');
}

await mongoose.connect(uri);

const databaseName = `gym_client_${tenantId}`;
const tenantDb = mongoose.connection.useDb(databaseName, { useCache: true });
const trainees = tenantDb.collection('trainees');
const PaymentTransactions = tenantDb.model<IPaymentTransaction>(
    'PaymentTransaction',
    PaymentTransactionSchema,
);

const stats = {
    scanned: 0,
    legacyRecords: 0,
    transactionsToCreate: 0,
    legacyFieldsToRemove: 0,
    conflicts: 0,
};

try {
    const legacyTrainees = await trainees.find({
        $or: [
            { paid: { $exists: true } },
            { remaining: { $exists: true } },
            { ledgerMigratedAt: { $exists: true } },
        ],
    }).toArray();

    for (const trainee of legacyTrainees) {
        stats.scanned += 1;
        stats.legacyRecords += 1;

        const billingCycleId = typeof trainee.billingCycleId === 'string' && trainee.billingCycleId
            ? trainee.billingCycleId
            : randomUUID();
        const storedTransactions = await PaymentTransactions.find({
            traineeId: trainee._id,
            billingCycleId,
            status: 'posted',
        }).lean();
        const legacyPaymentMinor = toMinorUnits(Number(trainee.paid) || 0);
        const shouldCreateLegacyPayment = storedTransactions.length === 0 && legacyPaymentMinor > 0;
        const ledgerTransactions = storedTransactions.map(transaction => ({
            type: transaction.type,
            amountMinor: transaction.amountMinor,
            status: transaction.status,
        }));

        if (shouldCreateLegacyPayment) {
            ledgerTransactions.push({
                type: 'payment' as const,
                amountMinor: legacyPaymentMinor,
                status: 'posted' as const,
            });
            stats.transactionsToCreate += 1;
        }

        const netPriceMinor = getNetPriceMinor({
            totalCost: Number(trainee.totalCost) || 0,
            discount: Number(trainee.discount) || 0,
        });
        const summary = calculateLedgerSummary(netPriceMinor, ledgerTransactions);
        if (summary.netPaidMinor > netPriceMinor) {
            stats.conflicts += 1;
            console.error(
                `[conflict] trainee=${trainee._id} memberId=${trainee.memberId ?? 'n/a'} ` +
                `ledgerNet=${summary.netPaidMinor} netPrice=${netPriceMinor}`,
            );
            continue;
        }

        stats.legacyFieldsToRemove += 1;
        if (!applyChanges) continue;

        if (shouldCreateLegacyPayment) {
            await PaymentTransactions.create({
                traineeId: trainee._id,
                billingCycleId,
                type: 'payment',
                amountMinor: legacyPaymentMinor,
                reason: 'Legacy balance migration',
            });
        }

        await trainees.updateOne(
            { _id: trainee._id },
            {
                $set: { billingCycleId },
                $unset: { paid: '', remaining: '', ledgerMigratedAt: '' },
            },
        );
    }

    console.log(JSON.stringify({
        mode: applyChanges ? 'apply' : 'dry-run',
        database: databaseName,
        ...stats,
    }, null, 2));

    if (stats.conflicts > 0) process.exitCode = 2;
} finally {
    await tenantDb.close();
    await mongoose.disconnect();
}
