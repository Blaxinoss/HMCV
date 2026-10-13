const uiLocale = () => (
  typeof document !== 'undefined' && document.documentElement.lang === 'ar' ? 'ar-EG' : 'en-EG'
);

export function formatCurrency(amount: number, locale = uiLocale()): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale = uiLocale()): string {
  return new Intl.NumberFormat(locale).format(value);
}
