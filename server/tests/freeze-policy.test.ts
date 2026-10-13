import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateFreezeStart,
    calculateUnfreezeEndDate,
    sameGymDay,
} from '../src/utils/freezePolicy.js';
import { TraineeSchema } from '../src/models/Trainees.js';
import {
    addGymCalendarMonths,
    calculateMembershipDaysLeft,
    isExpired,
    parseGymDate,
} from '../src/utils/dateTime.js';

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
    const currentEnd = parseGymDate('2026-09-10', 'end', timezone)!;
    const freezeStart = parseGymDate('2026-09-09', 'start', timezone)!;
    const now = new Date('2026-09-10T18:00:00.000Z');
    const result = calculateUnfreezeEndDate(currentEnd, freezeStart, now, timezone);

    assert.equal(result.elapsedDays, 1);
    assert.equal(result.endDate.toISOString(), '2026-09-11T20:59:59.999Z');
});

test('same local gym day means no elapsed freeze days', () => {
    const first = new Date('2026-09-09T01:00:00.000Z');
    const second = new Date('2026-09-09T20:00:00.000Z');

    assert.equal(sameGymDay(first, second, timezone), true);
});

test('trainee writes use optimistic concurrency for freeze transitions', () => {
    assert.equal(TraineeSchema.get('optimisticConcurrency'), true);
});

test('a monthly renewal keeps the same calendar day across different month lengths', () => {
    const januaryFifteenth = parseGymDate('2026-01-15', 'end', timezone)!;
    const februaryFifteenth = addGymCalendarMonths(januaryFifteenth, 1, timezone);
    const marchFifteenth = addGymCalendarMonths(februaryFifteenth, 1, timezone);

    assert.equal(februaryFifteenth.toISOString(), '2026-02-15T21:59:59.999Z');
    assert.equal(marchFifteenth.toISOString(), '2026-03-15T21:59:59.999Z');
});

test('a calendar month clamps an unavailable day to the end of the target month', () => {
    const januaryThirtyFirst = parseGymDate('2028-01-31', 'end', timezone)!;
    const result = addGymCalendarMonths(januaryThirtyFirst, 1, timezone);

    assert.equal(result.toISOString(), '2028-02-29T21:59:59.999Z');
});

test('a date-only subscription end remains valid through the Cairo calendar day', () => {
    const endDate = parseGymDate('2026-10-13', 'end', timezone)!;

    assert.equal(endDate.toISOString(), '2026-10-13T20:59:59.999Z');
    assert.equal(
        calculateMembershipDaysLeft(endDate, new Date('2026-10-13T10:00:00.000Z'), null, timezone),
        1,
    );
});

test('legacy UTC-midnight dates also remain valid through their Cairo calendar day', () => {
    const legacyEndDate = new Date('2026-10-13T00:00:00.000Z');

    assert.equal(isExpired(legacyEndDate, new Date('2026-10-13T18:00:00.000Z')), false);
    assert.equal(isExpired(legacyEndDate, new Date('2026-10-13T21:00:00.000Z')), true);
});

test('freezing from October 13 to November 13 extends by 31 calendar days', () => {
    const currentEnd = parseGymDate('2026-12-15', 'end', timezone)!;
    const freezeStart = parseGymDate('2026-10-13', 'start', timezone)!;
    const unfreezeTime = new Date('2026-11-13T10:00:00.000Z');
    const result = calculateUnfreezeEndDate(currentEnd, freezeStart, unfreezeTime, timezone);

    assert.equal(result.elapsedDays, 31);
    assert.equal(result.endDate.toISOString(), '2027-01-15T21:59:59.999Z');
});
