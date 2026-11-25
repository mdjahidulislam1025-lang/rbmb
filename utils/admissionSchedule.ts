import { AdmissionPortalMode, AdmissionScheduleConfig } from '../types';
import { getDhakaParts, getDhakaTodayISO } from './dhakaTime';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const BN_FULL_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const EN_FULL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const toBengaliDigits = (value: string | number): string => {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
};

export const formatAdmissionDate = (isoDate: string, lang: 'bn' | 'en'): string => {
  const match = (isoDate || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate || '';
  const year = Number(match[1]);
  const monthIdx = Math.max(0, Math.min(11, Number(match[2]) - 1));
  const day = Number(match[3]);

  if (lang === 'bn') {
    return `${toBengaliDigits(day)} ${BN_FULL_MONTHS[monthIdx]}, ${toBengaliDigits(year)}`;
  }
  return `${day} ${EN_FULL_MONTHS[monthIdx]}, ${year}`;
};

export const formatAdmissionFee = (amount: number, lang: 'bn' | 'en'): string => {
  const safeAmount = Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : 300;
  return lang === 'bn' ? `${toBengaliDigits(safeAmount)} টাকা` : `${safeAmount} BDT`;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const isIsoDate = (val?: string): val is string =>
  typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim());

/**
 * Default annual admission window:
 * Starts every year in December (Dec 1) for the upcoming academic session (year + 1),
 * running through January 15 (Exam Jan 18, Result Jan 20).
 * During January, keeps the active year's cycle visible; from February onward, targets December of the current year.
 */
export const getDefaultYearlyAdmissionCycle = (now: Date = new Date()): AdmissionScheduleConfig => {
  const parts = getDhakaParts(now);
  const startYear = parts.month === 1 ? parts.year - 1 : parts.year;
  const sessionNum = startYear + 1;

  return {
    mode: 'auto',
    startDate: `${startYear}-12-01`,
    deadlineDate: `${sessionNum}-01-15`,
    examDate: `${sessionNum}-01-18`,
    resultDate: `${sessionNum}-01-20`,
    feeAmount: 300,
    sessionYear: String(sessionNum),
    autoRollYearly: true,
    noticeNote: '',
  };
};

const rollIsoDateToYear = (iso: string, targetYear: number): string => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const month = Number(match[2]);
  const day = Number(match[3]);
  // Handle Feb 29 safely on non-leap years
  const maxDay = new Date(targetYear, month, 0).getDate();
  return `${targetYear}-${pad2(month)}-${pad2(Math.min(day, maxDay))}`;
};

export type AdmissionStatusReason =
  | 'active-window'
  | 'upcoming-december'
  | 'deadline-passed'
  | 'manual-open'
  | 'manual-closed';

export interface ResolvedAdmissionSchedule extends AdmissionScheduleConfig {
  sessionYear: string;
  autoRollYearly: boolean;
  isOpen: boolean;
  statusReason: AdmissionStatusReason;
  todayIso: string;
  isDecemberMonth: boolean;
}

export const sanitizeAdmissionScheduleConfig = (
  raw?: Partial<AdmissionScheduleConfig> | null
): AdmissionScheduleConfig => {
  const defaults = getDefaultYearlyAdmissionCycle();
  const mode: AdmissionPortalMode =
    raw?.mode === 'open' || raw?.mode === 'closed' || raw?.mode === 'auto' ? raw.mode : 'auto';
  const feeNum = Number(raw?.feeAmount);
  const feeAmount = Number.isFinite(feeNum) && feeNum >= 0 && feeNum <= 50000 ? Math.round(feeNum) : defaults.feeAmount;

  return {
    mode,
    startDate: isIsoDate(raw?.startDate) ? raw!.startDate.trim() : defaults.startDate,
    deadlineDate: isIsoDate(raw?.deadlineDate) ? raw!.deadlineDate.trim() : defaults.deadlineDate,
    examDate: isIsoDate(raw?.examDate) ? raw!.examDate.trim() : defaults.examDate,
    resultDate: isIsoDate(raw?.resultDate) ? raw!.resultDate.trim() : defaults.resultDate,
    feeAmount,
    sessionYear: (raw?.sessionYear || '').trim().slice(0, 16) || defaults.sessionYear,
    autoRollYearly: raw?.autoRollYearly !== false,
    noticeNote: (raw?.noticeNote || '').trim().slice(0, 300),
  };
};

export const resolveAdmissionSchedule = (
  raw?: Partial<AdmissionScheduleConfig> | null,
  now: Date = new Date()
): ResolvedAdmissionSchedule => {
  const parts = getDhakaParts(now);
  const todayIso = getDhakaTodayISO(now);
  const defaults = getDefaultYearlyAdmissionCycle(now);
  const clean = sanitizeAdmissionScheduleConfig(raw);
  const autoRollYearly = clean.autoRollYearly !== false;

  let startDate = clean.startDate;
  let deadlineDate = clean.deadlineDate;
  let examDate = clean.examDate;
  let resultDate = clean.resultDate;
  let sessionYear = clean.sessionYear || defaults.sessionYear || String(parts.year + 1);

  // If autoRollYearly is enabled and a previous year's admission cycle has already concluded
  // (we are in February or later of the cycle's end year, or a later year entirely),
  // automatically advance the admin's configured month/day schedule to the new December cycle.
  if (autoRollYearly && clean.mode === 'auto') {
    const endYear = Number(resultDate.slice(0, 4)) || Number(deadlineDate.slice(0, 4)) || parts.year;
    const rolloverThreshold = `${endYear}-02-01`;
    if (todayIso > resultDate && todayIso >= rolloverThreshold) {
      const targetStartYear = parts.month === 1 ? parts.year - 1 : parts.year;
      const targetSessionYear = targetStartYear + 1;
      const startMonth = Number(startDate.slice(5, 7)) || 12;
      const deadlineMonth = Number(deadlineDate.slice(5, 7)) || 1;
      const examMonth = Number(examDate.slice(5, 7)) || 1;
      const resultMonth = Number(resultDate.slice(5, 7)) || 1;

      startDate = rollIsoDateToYear(startDate, startMonth >= 10 ? targetStartYear : targetSessionYear);
      deadlineDate = rollIsoDateToYear(deadlineDate, deadlineMonth >= 10 ? targetStartYear : targetSessionYear);
      examDate = rollIsoDateToYear(examDate, examMonth >= 10 ? targetStartYear : targetSessionYear);
      resultDate = rollIsoDateToYear(resultDate, resultMonth >= 10 ? targetStartYear : targetSessionYear);
      sessionYear = String(targetSessionYear);
    }
  }

  let isOpen = false;
  let statusReason: AdmissionStatusReason = 'upcoming-december';

  if (clean.mode === 'open') {
    isOpen = true;
    statusReason = 'manual-open';
  } else if (clean.mode === 'closed') {
    isOpen = false;
    statusReason = 'manual-closed';
  } else {
    if (todayIso >= startDate && todayIso <= deadlineDate) {
      isOpen = true;
      statusReason = 'active-window';
    } else if (todayIso < startDate) {
      isOpen = false;
      statusReason = 'upcoming-december';
    } else {
      isOpen = false;
      statusReason = 'deadline-passed';
    }
  }

  return {
    mode: clean.mode,
    startDate,
    deadlineDate,
    examDate,
    resultDate,
    feeAmount: clean.feeAmount,
    sessionYear,
    autoRollYearly,
    noticeNote: clean.noticeNote || '',
    isOpen,
    statusReason,
    todayIso,
    isDecemberMonth: parts.month === 12,
  };
};
