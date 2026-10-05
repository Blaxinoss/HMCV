import type { Trainee } from '../types';

export const toMajorUnits = (amountMinor: number): number => amountMinor / 100;

export const getNetCollected = (trainee: Trainee): number =>
    toMajorUnits(trainee.ledgerSummary.netPaidMinor);

export const getOutstandingBalance = (trainee: Trainee): number =>
    toMajorUnits(trainee.ledgerSummary.outstandingMinor);
