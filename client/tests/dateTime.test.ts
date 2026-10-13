import { describe, expect, test } from 'bun:test';
import { DateTime } from 'luxon';
import {
  addGymCalendarMonthsToInput,
  currentGymMonth,
  isGymDateExpired,
  recentGymMonths,
  toGymDateInput,
} from '../src/utils/dateTime';

describe('frontend gym date handling', () => {
  test('date-only values keep their Cairo calendar day', () => {
    expect(toGymDateInput('2026-10-13')).toBe('2026-10-13');
  });

  test('UTC instants display on their Cairo calendar day', () => {
    expect(toGymDateInput('2026-10-12T22:30:00.000Z')).toBe('2026-10-13');
  });

  test('a subscription remains valid throughout its end day', () => {
    const midday = DateTime.fromISO('2026-10-13T12:00:00', { zone: 'Africa/Cairo' });
    const nextDay = DateTime.fromISO('2026-10-14T00:00:00', { zone: 'Africa/Cairo' });
    expect(isGymDateExpired('2026-10-13', midday)).toBe(false);
    expect(isGymDateExpired('2026-10-13', nextDay)).toBe(true);
  });

  test('calendar-month defaults clamp unavailable dates', () => {
    expect(addGymCalendarMonthsToInput('2025-01-31', 1)).toBe('2025-02-28');
    expect(addGymCalendarMonthsToInput('2024-01-31', 1)).toBe('2024-02-29');
  });

  test('month navigation crosses year boundaries without browser timezone math', () => {
    expect(recentGymMonths(3, '2026-01')).toEqual(['2025-11', '2025-12', '2026-01']);
  });

  test('current month is determined in Cairo', () => {
    const instant = DateTime.fromISO('2026-12-31T22:30:00Z');
    expect(currentGymMonth(instant)).toBe('2027-01');
  });
});
