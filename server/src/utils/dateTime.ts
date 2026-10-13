import { DateTime } from 'luxon';

export const DEFAULT_GYM_TIMEZONE = process.env.GYM_TIMEZONE || 'Africa/Cairo';

export type GymDayBoundary = 'start' | 'end';

export function utcNow(): Date {
    return DateTime.utc().toJSDate();
}

export function utcNowIso(): string {
    return DateTime.utc().toISO();
}

export function toGymDateTime(date: Date, timezone = DEFAULT_GYM_TIMEZONE): DateTime {
    return DateTime.fromJSDate(date, { zone: timezone });
}

export function startOfGymDay(date: Date, timezone = DEFAULT_GYM_TIMEZONE): Date {
    return toGymDateTime(date, timezone).startOf('day').toUTC().toJSDate();
}

export function endOfGymDay(date: Date, timezone = DEFAULT_GYM_TIMEZONE): Date {
    return toGymDateTime(date, timezone).endOf('day').toUTC().toJSDate();
}

export function parseGymDate(
    value: unknown,
    boundary: GymDayBoundary,
    timezone = DEFAULT_GYM_TIMEZONE,
): Date | null {
    if (value instanceof Date) {
        if (!DateTime.fromJSDate(value).isValid) return null;
        return (boundary === 'start' ? startOfGymDay : endOfGymDay)(value, timezone);
    }

    if (typeof value !== 'string' || value.trim() === '') return null;

    const input = value.trim();
    const parsed = DateTime.fromISO(input, { zone: timezone, setZone: true }).setZone(timezone);

    if (!parsed.isValid) return null;

    return (boundary === 'start' ? parsed.startOf('day') : parsed.endOf('day'))
        .toUTC()
        .toJSDate();
}

export function isExpired(
    endDate: Date,
    now = utcNow(),
    timezone = DEFAULT_GYM_TIMEZONE,
): boolean {
    return toGymDateTime(endDate, timezone).endOf('day').toMillis()
        < toGymDateTime(now, timezone).toMillis();
}

export function addGymCalendarMonths(
    date: Date,
    months: number,
    timezone = DEFAULT_GYM_TIMEZONE,
): Date {
    if (!Number.isInteger(months) || months <= 0) {
        throw new Error('durationInMonths must be a positive integer');
    }

    return toGymDateTime(date, timezone)
        .plus({ months })
        .endOf('day')
        .toUTC()
        .toJSDate();
}

export function calculateMembershipDaysLeft(
    subscriptionEndDate: Date,
    now = utcNow(),
    freezeStartDate?: Date | null,
    timezone = DEFAULT_GYM_TIMEZONE,
): number {
    const reference = freezeStartDate ?? now;
    const endDay = toGymDateTime(subscriptionEndDate, timezone).startOf('day');
    const referenceDay = toGymDateTime(reference, timezone).startOf('day');
    const difference = Math.round(endDay.diff(referenceDay, 'days').days);

    return Math.max(0, difference + 1);
}
