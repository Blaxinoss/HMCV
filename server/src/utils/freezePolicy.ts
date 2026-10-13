import { DEFAULT_GYM_TIMEZONE, startOfGymDay, toGymDateTime } from './dateTime.js';

export { DEFAULT_GYM_TIMEZONE, startOfGymDay } from './dateTime.js';

export function sameGymDay(first: Date, second: Date, timezone = DEFAULT_GYM_TIMEZONE): boolean {
    return toGymDateTime(first, timezone).hasSame(toGymDateTime(second, timezone), 'day');
}

export function calculateFreezeStart(
    now: Date,
    lastAttendance?: Date | null,
    timezone = DEFAULT_GYM_TIMEZONE,
): Date {
    const today = toGymDateTime(now, timezone).startOf('day');
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
    const freezeStart = toGymDateTime(freezeStartDate, timezone).startOf('day');
    const unfreezeDay = toGymDateTime(now, timezone).startOf('day');
    const elapsedDays = Math.max(0, Math.round(unfreezeDay.diff(freezeStart, 'days').days));
    const endDate = toGymDateTime(currentEndDate, timezone)
        .plus({ days: elapsedDays })
        .endOf('day')
        .toUTC()
        .toJSDate();

    return { endDate, elapsedDays };
}
