export const DHAKA_TIME_ZONE = 'Asia/Dhaka';

export interface DhakaTimeParts {
  year: number;
  month: number;
  day: number;
  monthPadded: string;
  dayPadded: string;
  hour12: string;
  hour24: number;
  minute: string;
  second: string;
  dayPeriod: 'AM' | 'PM';
}

export const getDhakaParts = (date: Date = new Date()): DhakaTimeParts => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DHAKA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const year = Number(pick('year')) || date.getUTCFullYear();
  const monthPadded = pick('month') || '01';
  const dayPadded = pick('day') || '01';
  const hour12 = (pick('hour') || '12').padStart(2, '0');
  const minute = (pick('minute') || '00').padStart(2, '0');
  const second = (pick('second') || '00').padStart(2, '0');
  const rawPeriod = (pick('dayPeriod') || 'AM').toUpperCase();
  const dayPeriod: 'AM' | 'PM' = rawPeriod === 'PM' ? 'PM' : 'AM';

  const hNum = Number(hour12) % 12;
  const hour24 = dayPeriod === 'PM' ? hNum + 12 : hNum;

  return {
    year,
    month: Number(monthPadded) || 1,
    day: Number(dayPadded) || 1,
    monthPadded,
    dayPadded,
    hour12,
    hour24,
    minute,
    second,
    dayPeriod,
  };
};

export const getDhakaTodayISO = (date: Date = new Date()): string => {
  const p = getDhakaParts(date);
  return `${p.year}-${p.monthPadded}-${p.dayPadded}`;
};

export const getDhakaYear = (date: Date = new Date()): number => {
  return getDhakaParts(date).year;
};

/**
 * Generates an official GMT+6 notice timestamp string <= 27 chars
 * (strictly fits Firestore rules `data.date.size() <= 32`).
 * Example: "2026-11-24 · 10:05 AM GMT+6"
 */
export const getDhakaNoticeStamp = (date: Date = new Date()): string => {
  const p = getDhakaParts(date);
  return `${p.year}-${p.monthPadded}-${p.dayPadded} · ${p.hour12}:${p.minute} ${p.dayPeriod} GMT+6`.slice(0, 32);
};

export const extractIsoDate = (raw?: string): string => {
  if (!raw) return '';
  const match = raw.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

export const attachDhakaTimeToDate = (dateOrStamp?: string, date: Date = new Date()): string => {
  const iso = extractIsoDate(dateOrStamp) || getDhakaTodayISO(date);
  const p = getDhakaParts(date);
  return `${iso} · ${p.hour12}:${p.minute} ${p.dayPeriod} GMT+6`.slice(0, 32);
};

export const extractNoticeTimeLabel = (raw?: string): string => {
  if (!raw) return '';
  const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)(?:\s*GMT\+6)?)/i);
  if (match) return match[1].trim();
  return '';
};

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BN_MONTHS = [
  'জানু',
  'ফেব্রু',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টে',
  'অক্টো',
  'নভে',
  'ডিসে',
];

export const formatNoticeDateBadge = (
  raw: string,
  lang: 'bn' | 'en'
): {
  isoDate: string;
  monthLabel: string;
  dayLabel: string;
  yearLabel: string;
  timeLabel: string;
} => {
  const isoDate = extractIsoDate(raw);
  const timeLabel = extractNoticeTimeLabel(raw);

  if (!isoDate) {
    return {
      isoDate: raw || '',
      monthLabel: String(getDhakaYear()),
      dayLabel: '--',
      yearLabel: String(getDhakaYear()),
      timeLabel,
    };
  }

  const [yStr, mStr, dStr] = isoDate.split('-');
  const mIdx = Math.max(0, Math.min(11, (Number(mStr) || 1) - 1));
  const dayNum = Number(dStr) || 1;

  return {
    isoDate,
    monthLabel: lang === 'bn' ? BN_MONTHS[mIdx] : EN_MONTHS[mIdx],
    dayLabel: String(dayNum).padStart(2, '0'),
    yearLabel: yStr,
    timeLabel,
  };
};

export const formatDhakaClock = (lang: 'bn' | 'en', date: Date = new Date()): string => {
  const p = getDhakaParts(date);
  const monthLabel = lang === 'bn' ? BN_MONTHS[p.month - 1] : EN_MONTHS[p.month - 1];
  return `${p.dayPadded} ${monthLabel} ${p.year} · ${p.hour12}:${p.minute} ${p.dayPeriod} (GMT+6)`;
};
