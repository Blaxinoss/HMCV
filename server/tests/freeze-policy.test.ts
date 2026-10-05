import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateFreezeStart,
    calculateUnfreezeEndDate,
    sameGymDay,
} from '../src/utils/freezePolicy.js';
import { TraineeSchema } from '../src/models/Trainees.js';

const timezone = 'Africa/Cairo';

test('same-day attendance moves freeze start to the next gym day', () => {
    const now = new Date('2026-09-09T18:00:00.000Z');
    const attendance = new Date('2026-09-09T10:00:00.000Z');
    const freezeStart = calculateFreezeStart(now, attendance, timezone);

    assert.equal(freezeStart.toISOString(), '2026-09-09T21:00:00.000Z');
});

test('attendance on a previous gym day does not delay the freeze', () => {
    const now = new Date('2026-09-09T18:00:00.000Z');
    const attendance = new Date('2026-09-08T18:00:00.000Z');
    const freezeStart = calculateFreezeStart(now, attendance, timezone);

    assert.equal(freezeStart.toISOString(), '2026-09-08T21:00:00.000Z');
});

test('unfreeze extends by calendar days even when derived daysLeft is zero', () => {
    const currentEnd = new Date('2026-09-10T21:59:59.000Z');
    const freezeStart = new Date('2026-09-08T22:00:00.000Z');
    const now = new Date('2026-09-10T18:00:00.000Z');
    const result = calculateUnfreezeEndDate(currentEnd, freezeStart, now, timezone);

    assert.equal(result.elapsedDays, 1);
    assert.equal(result.endDate.toISOString(), '2026-09-11T21:59:59.000Z');
});

test('same local gym day means no elapsed freeze days', () => {
    const first = new Date('2026-09-09T01:00:00.000Z');
    const second = new Date('2026-09-09T20:00:00.000Z');

    assert.equal(sameGymDay(first, second, timezone), true);
});

test('trainee writes use optimistic concurrency for freeze transitions', () => {
    assert.equal(TraineeSchema.get('optimisticConcurrency'), true);
});
