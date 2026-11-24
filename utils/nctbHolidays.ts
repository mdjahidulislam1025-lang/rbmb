import { Holiday } from '../types';
import { getDhakaYear, extractIsoDate } from './dhakaTime';

interface LunarHolidayOffsets {
  shabEBarat: string;
  eidUlFitr: string;
  buddhaPurnima: string;
  summerEidUlAdha: string;
  ashura: string;
  janmashtami: string;
  miladunnabi: string;
  durgaPuja: string;
}

const LUNAR_HOLIDAY_CALENDAR: Record<number, LunarHolidayOffsets> = {
  2025: {
    shabEBarat: '2025-02-15',
    eidUlFitr: '2025-03-26',
    buddhaPurnima: '2025-05-11',
    summerEidUlAdha: '2025-06-05',
    ashura: '2025-07-06',
    janmashtami: '2025-08-16',
    miladunnabi: '2025-09-05',
    durgaPuja: '2025-09-28',
  },
  2026: {
    shabEBarat: '2026-02-04',
    eidUlFitr: '2026-03-19',
    buddhaPurnima: '2026-05-01',
    summerEidUlAdha: '2026-05-27',
    ashura: '2026-06-26',
    janmashtami: '2026-09-04',
    miladunnabi: '2026-08-26',
    durgaPuja: '2026-10-18',
  },
  2027: {
    shabEBarat: '2027-01-24',
    eidUlFitr: '2027-03-08',
    buddhaPurnima: '2027-05-20',
    summerEidUlAdha: '2027-05-16',
    ashura: '2027-06-15',
    janmashtami: '2027-08-25',
    miladunnabi: '2027-08-15',
    durgaPuja: '2027-10-07',
  },
  2028: {
    shabEBarat: '2028-01-13',
    eidUlFitr: '2028-02-26',
    buddhaPurnima: '2028-05-08',
    summerEidUlAdha: '2028-05-04',
    ashura: '2028-06-03',
    janmashtami: '2028-08-13',
    miladunnabi: '2028-08-03',
    durgaPuja: '2028-09-25',
  },
  2029: {
    shabEBarat: '2029-01-01',
    eidUlFitr: '2029-02-14',
    buddhaPurnima: '2029-05-27',
    summerEidUlAdha: '2029-04-23',
    ashura: '2029-05-23',
    janmashtami: '2029-09-01',
    miladunnabi: '2029-07-24',
    durgaPuja: '2029-10-14',
  },
  2030: {
    shabEBarat: '2030-12-21',
    eidUlFitr: '2030-02-04',
    buddhaPurnima: '2030-05-17',
    summerEidUlAdha: '2030-06-01',
    ashura: '2030-05-12',
    janmashtami: '2030-08-21',
    miladunnabi: '2030-07-13',
    durgaPuja: '2030-10-03',
  },
};

const approximateLunarDate = (year: number, baseMonth: number, baseDay: number): string => {
  const deltaYears = year - 2026;
  const approx = new Date(Date.UTC(2026, baseMonth - 1, baseDay));
  approx.setUTCDate(approx.getUTCDate() + deltaYears * 354);
  const y = year;
  const m = String(approx.getUTCMonth() + 1).padStart(2, '0');
  const d = String(approx.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const generateNctbAnnualHolidays = (year: number = getDhakaYear()): Holiday[] => {
  const lunar = LUNAR_HOLIDAY_CALENDAR[year] || {
    shabEBarat: approximateLunarDate(year, 2, 4),
    eidUlFitr: approximateLunarDate(year, 3, 19),
    buddhaPurnima: approximateLunarDate(year, 5, 1),
    summerEidUlAdha: approximateLunarDate(year, 5, 27),
    ashura: approximateLunarDate(year, 6, 26),
    janmashtami: approximateLunarDate(year, 9, 4),
    miladunnabi: approximateLunarDate(year, 8, 26),
    durgaPuja: approximateLunarDate(year, 10, 18),
  };

  const list: Holiday[] = [
    {
      id: `nctb-${year}-01`,
      title: {
        bn: 'পবিত্র শবে বরাত (NCTB)',
        en: 'Shab-e-Barat (NCTB)',
      },
      date: lunar.shabEBarat,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'Religious',
      isPublic: true,
    },
    {
      id: `nctb-${year}-02`,
      title: {
        bn: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস',
        en: 'Shaheed Day & Int. Mother Language Day',
      },
      date: `${year}-02-21`,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'National',
      isPublic: true,
    },
    {
      id: `nctb-${year}-03`,
      title: {
        bn: 'পবিত্র রমজান, শবে কদর ও ঈদ-উল-ফিতর অবকাশ (NCTB)',
        en: 'Ramadan, Shab-e-Qadr & Eid-ul-Fitr Break (NCTB)',
      },
      date: lunar.eidUlFitr,
      duration: { bn: '৮ দিন', en: '8 Days' },
      type: 'Religious',
      isPublic: true,
    },
    {
      id: `nctb-${year}-04`,
      title: {
        bn: 'মহান স্বাধীনতা ও জাতীয় দিবস',
        en: 'Independence & National Day',
      },
      date: `${year}-03-26`,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'National',
      isPublic: true,
    },
    {
      id: `nctb-${year}-05`,
      title: {
        bn: 'বাংলা নববর্ষ (পহেলা বৈশাখ)',
        en: 'Pahela Baishakh (Bangla New Year)',
      },
      date: `${year}-04-14`,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'National',
      isPublic: true,
    },
    {
      id: `nctb-${year}-06`,
      title: {
        bn: 'মহান মে দিবস ও বুদ্ধ পূর্ণিমা',
        en: 'May Day & Buddha Purnima',
      },
      date: `${year}-05-01`,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'National',
      isPublic: true,
    },
    {
      id: `nctb-${year}-07`,
      title: {
        bn: 'গ্রীষ্মকালীন অবকাশ ও পবিত্র ঈদ-উল-আযহা (NCTB)',
        en: 'Summer Vacation & Eid-ul-Adha (NCTB)',
      },
      date: lunar.summerEidUlAdha,
      duration: { bn: '১২ দিন', en: '12 Days' },
      type: 'Seasonal',
      isPublic: true,
    },
    {
      id: `nctb-${year}-08`,
      title: {
        bn: 'পবিত্র আশুরা (NCTB)',
        en: 'Holy Ashura (NCTB)',
      },
      date: lunar.ashura,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'Religious',
      isPublic: true,
    },
    {
      id: `nctb-${year}-09`,
      title: {
        bn: 'পবিত্র ঈদে মিলাদুন্নবী (সা.)',
        en: 'Eid-e-Miladunnabi (PBUH)',
      },
      date: lunar.miladunnabi,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'Religious',
      isPublic: true,
    },
    {
      id: `nctb-${year}-10`,
      title: {
        bn: 'শুভ জন্মাষ্টমী',
        en: 'Shubho Janmashtami',
      },
      date: lunar.janmashtami,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'Religious',
      isPublic: true,
    },
    {
      id: `nctb-${year}-11`,
      title: {
        bn: 'শারদীয় দুর্গাপূজা, লক্ষ্মীপূজা ও প্রবারণা পূর্ণিমা (NCTB)',
        en: 'Durga Puja & Autumn Vacation (NCTB)',
      },
      date: lunar.durgaPuja,
      duration: { bn: '৭ দিন', en: '7 Days' },
      type: 'Religious',
      isPublic: true,
    },
    {
      id: `nctb-${year}-12`,
      title: {
        bn: 'মহান বিজয় দিবস',
        en: 'Victory Day of Bangladesh',
      },
      date: `${year}-12-16`,
      duration: { bn: '১ দিন', en: '1 Day' },
      type: 'National',
      isPublic: true,
    },
    {
      id: `nctb-${year}-13`,
      title: {
        bn: 'শীতকালীন অবকাশ ও যীশুখ্রিস্টের জন্মদিন (বড়দিন) (NCTB)',
        en: 'Winter Vacation & Christmas Day (NCTB)',
      },
      date: `${year}-12-20`,
      duration: { bn: '১০ দিন', en: '10 Days' },
      type: 'Seasonal',
      isPublic: true,
    },
  ];

  return list.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Automatically ensures NCTB-prescribed holidays for the active GMT+6 year
 * are populated alongside any saved/admin-edited holidays without duplicates.
 */
export const mergeNctbHolidaysForActiveYear = (
  savedHolidays: Holiday[],
  activeYear: number = getDhakaYear()
): Holiday[] => {
  const nctbAnnual = generateNctbAnnualHolidays(activeYear);
  const byId = new Map<string, Holiday>();
  const existingYearKeys = new Set<string>();

  savedHolidays.forEach((h) => {
    const iso = extractIsoDate(h.date);
    byId.set(h.id, h);
    if (iso.startsWith(`${activeYear}-`)) {
      existingYearKeys.add(`${iso}__${h.type}`);
    }
  });

  nctbAnnual.forEach((nh) => {
    if (byId.has(nh.id)) return;
    const key = `${nh.date}__${nh.type}`;
    if (existingYearKeys.has(key)) return;
    byId.set(nh.id, nh);
  });

  return Array.from(byId.values()).sort((a, b) => a.date.localeCompare(b.date));
};
