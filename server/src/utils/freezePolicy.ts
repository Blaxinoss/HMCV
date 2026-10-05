import { DateTime } from 'luxon';

export const DEFAULT_GYM_TIMEZONE = process.env.GYM_TIMEZONE || 'Africa/Cairo';

export function startOfGymDay(date: Date, timezone = DEFAULT_GYM_TIMEZONE): Date {
    return DateTime.fromJSDate(date, { zone: timezone }).startOf('day').toUTC().toJSDate();
}

export function sameGymDay(first: Date, second: Date, timezone = DEFAULT_GYM_TIMEZONE): boolean {
    return startOfGymDay(first, timezone).getTime() === startOfGymDay(second, timezone).getTime();
}

export function calculateFreezeStart(
    now: Date,
    lastAttendance?: Date | null,
    timezone = DEFAULT_GYM_TIMEZONE,
): Date {
    const today = DateTime.fromJSDate(now, { zone: timezone }).startOf('day');
    return (lastAttendance && sameGymDay(lastAttendance, now, timezone)
        ? today.plus({ days: 1 })
        : today
    ).toUTC().toJSDate();
}

export function calculateUnfreezeEndDate(
    currentEndDate: Date,
    freezeStartDate: Date,
    now: Date,
    timezone = DEFAULT_GYM_TIMEZONE,
): { endDate: Date; elapsedDays: number } {
    const freezeStart = DateTime.fromJSDate(freezeStartDate, { zone: timezone }).startOf('day');
    const unfreezeDay = DateTime.fromJSDate(now, { zone: timezone }).startOf('day');
    const elapsedDays = Math.max(0, Math.floor(unfreezeDay.diff(freezeStart, 'days').days));
    const endDate = DateTime.fromJSDate(currentEndDate, { zone: timezone })
        .plus({ days: elapsedDays })
        .toJSDate();

    return { endDate, elapsedDays };
}
