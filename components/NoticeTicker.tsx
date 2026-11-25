import * as React from 'react';
import * as RouterDom from 'react-router-dom';
import { Bell } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import { formatAdmissionDate, resolveAdmissionSchedule, toBengaliDigits } from '../utils/admissionSchedule';

const { Link } = RouterDom;

const NoticeTicker: React.FC = () => {
  const { lang, t, notices, settings } = useApp();
  const latestNotice = notices && notices.length > 0 ? notices[0] : null;
  const schedule = resolveAdmissionSchedule(settings.admissionSchedule);
  const admissionTickerText = schedule.isOpen
    ? lang === 'bn'
      ? `${toBengaliDigits(schedule.sessionYear)} শিক্ষাবর্ষে অনলাইন ভর্তি চলছে (শেষ তারিখ: ${formatAdmissionDate(schedule.deadlineDate, 'bn')})...`
      : `Online Admission Open for Session ${schedule.sessionYear} (Deadline: ${formatAdmissionDate(schedule.deadlineDate, 'en')})...`
    : lang === 'bn'
    ? `${toBengaliDigits(schedule.sessionYear)} শিক্ষাবর্ষে অনলাইন ভর্তি শুরু: ${formatAdmissionDate(schedule.startDate, 'bn')}`
    : `Session ${schedule.sessionYear} Online Admission Opens: ${formatAdmissionDate(schedule.startDate, 'en')}`;

  return (
    <div className="bg-emerald-700 dark:bg-emerald-900 text-white py-2 overflow-hidden flex items-center h-10 border-b border-emerald-800/40 no-print">
      <div className="px-4 flex items-center shrink-0 z-10 bg-emerald-700 dark:bg-emerald-900 font-bold border-r border-emerald-600 dark:border-emerald-700 text-xs sm:text-sm h-full">
        <Bell className="w-4 h-4 mr-2 animate-bounce text-yellow-300" />
        {t(TRANSLATIONS.ui.latestNews)}
      </div>
      <div className="whitespace-nowrap flex-grow relative overflow-hidden">
        <Link to="/notices" className="inline-block animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] px-4 text-xs sm:text-sm">
          {latestNotice ? (
            <>
              <span className="mx-8 font-bold">{t(latestNotice.title)} ({latestNotice.date})</span>
              <span className="mx-6 opacity-60">|</span>
              <span className="mx-8 font-medium">{t(settings.name)}{t(TRANSLATIONS.ui.welcome)}</span>
              <span className="mx-6 opacity-60">|</span>
              <span className="mx-8 font-bold">{t(latestNotice.title)} ({latestNotice.date})</span>
              <span className="mx-6 opacity-60">|</span>
              <span className="mx-8 font-medium">{t(settings.name)}{t(TRANSLATIONS.ui.welcome)}</span>
            </>
          ) : (
            <>
              <span className="mx-8 font-bold">{t(settings.name)}{t(TRANSLATIONS.ui.welcome)}</span>
              <span className="mx-8 font-bold">{admissionTickerText}</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
};

export default NoticeTicker;
