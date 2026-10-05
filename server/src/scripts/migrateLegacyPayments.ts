import 'dotenv/config';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { TraineeSchema } from '../models/Trainees.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import { toMinorUnits } from '../services/financeService.js';

const uri = process.env.DB_URI;
if (!uri) {
    throw new Error('DB_URI is not defined');
}

await mongoose.connect(uri);

const Trainees = mongoose.model('Trainees', TraineeSchema);

try {
    const trainees = await Trainees.find({ ledgerMigratedAt: null });
    let migrated = 0;

    for (const trainee of trainees) {
        const billingCycleId = trainee.billingCycleId || randomUUID();
        trainee.billingCycleId = billingCycleId;

        const existingTransaction = await PaymentTransaction.exists({
            traineeId: trainee._id,
            billingCycleId,
        });

        if (!existingTransaction && trainee.paid > 0) {
            await PaymentTransaction.create({
                traineeId: trainee._id,
                billingCycleId,
                type: 'payment',
                amountMinor: toMinorUnits(trainee.paid),
                reason: 'Legacy paid balance migration',
            });
        }

        trainee.ledgerMigratedAt = new Date();
        await trainee.save();
        migrated += 1;
    }

    console.log(`Migrated ${migrated} trainee ledger records.`);
} finally {
    await mongoose.disconnect();
}
