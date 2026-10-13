import { DateTime } from 'luxon';

export const GYM_TIMEZONE = import.meta.env.VITE_GYM_TIMEZONE || 'Africa/Cairo';

type DateValue = string | Date | null | undefined;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

const uiLocale = () => (
  typeof document !== 'undefined' && document.documentElement.lang
    ? document.documentElement.lang
    : 'en-GB'
);

export function toGymDateTime(value: DateValue): DateTime | null {
  if (!value) return null;

  if (value instanceof Date) {
    const parsed = DateTime.fromJSDate(value).setZone(GYM_TIMEZONE);
    return parsed.isValid ? parsed : null;
  }

  const parsed = DATE_ONLY_PATTERN.test(value)
    ? DateTime.fromISO(value, { zone: GYM_TIMEZONE })
    : DateTime.fromISO(value, { setZone: true }).setZone(GYM_TIMEZONE);

  return parsed.isValid ? parsed : null;
}

export function formatGymDate(value: DateValue, locale = uiLocale()): string {
  const parsed = toGymDateTime(value);
  return parsed ? parsed.setLocale(locale).toLocaleString(DateTime.DATE_SHORT) : '-';
}

export function formatGymTime(value: DateValue, locale = uiLocale()): string {
  const parsed = toGymDateTime(value);
  return parsed
    ? parsed.setLocale(locale).toLocaleString({ hour: '2-digit', minute: '2-digit' })
    : '-';
}

export function formatGymDateTime(value: DateValue, locale = uiLocale()): string {
  const parsed = toGymDateTime(value);
  return parsed ? parsed.setLocale(locale).toLocaleString(DateTime.DATETIME_SHORT) : '-';
}

export function toGymDateInput(value: DateValue): string {
  const parsed = toGymDateTime(value);
  return parsed ? parsed.toFormat('yyyy-MM-dd') : '';
}

export function gymTodayInput(now: DateTime = DateTime.now()): string {
  return now.setZone(GYM_TIMEZONE).toFormat('yyyy-MM-dd');
}

export function addGymCalendarMonthsToInput(value: DateValue, months: number): string {
  const parsed = toGymDateTime(value);
  return parsed ? parsed.plus({ months }).toFormat('yyyy-MM-dd') : '';
}

export function isGymDateExpired(value: DateValue, now: DateTime = DateTime.now()): boolean {
  const parsed = toGymDateTime(value);
  if (!parsed) return false;
  const gymNow = now.setZone(GYM_TIMEZONE);
  return parsed.endOf('day').toMillis() < gymNow.toMillis();
}

export function currentGymMonth(now: DateTime = DateTime.now()): string {
  return now.setZone(GYM_TIMEZONE).toFormat('yyyy-MM');
}

export function shiftGymMonth(month: string, amount: number): string {
  if (!MONTH_PATTERN.test(month)) return currentGymMonth();
  const parsed = DateTime.fromFormat(month, 'yyyy-MM', { zone: GYM_TIMEZONE });
  return parsed.isValid ? parsed.plus({ months: amount }).toFormat('yyyy-MM') : currentGymMonth();
}

export function formatGymMonth(month: string, locale = uiLocale(), short = false): string {
  if (!MONTH_PATTERN.test(month)) return month;
  const parsed = DateTime.fromFormat(month, 'yyyy-MM', { zone: GYM_TIMEZONE });
  if (!parsed.isValid) return month;
  return parsed.setLocale(locale).toFormat(short ? 'LLL' : 'LLLL yyyy');
}

export function recentGymMonths(count: number, endingMonth = currentGymMonth()): string[] {
  return Array.from({ length: count }, (_, index) => shiftGymMonth(endingMonth, index - count + 1));
}
