import i18n from '../i18n';

export function t(key: string, options?: Record<string, string | number>): string {
  return i18n.t(key, options);
}

export function getWeekdays(): string[] {
  return [
    t('weekday.mon'),
    t('weekday.tue'),
    t('weekday.wed'),
    t('weekday.thu'),
    t('weekday.fri'),
    t('weekday.sat'),
    t('weekday.sun'),
  ];
}
