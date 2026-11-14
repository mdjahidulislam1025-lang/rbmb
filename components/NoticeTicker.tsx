
import * as React from 'react';
import { Bell } from 'lucide-react';
import { SCHOOL_NAME, TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const NoticeTicker: React.FC = () => {
  const { t, notices, settings } = useApp();
  
  // Use dynamic notices from context instead of static constants
  const latestNotice = notices && notices.length > 0 ? notices[0] : null;

  return (
    <div className="bg-green-600 text-white py-2 overflow-hidden flex items-center h-10">
      <div className="px-4 flex items-center shrink-0 z-10 bg-green-600 font-bold border-r border-green-500 text-sm h-full">
        <Bell className="w-4 h-4 mr-2 animate-bounce" />
        {t(TRANSLATIONS.ui.latestNews)}
      </div>
      <div className="whitespace-nowrap flex-grow relative overflow-hidden">
        <div className="inline-block animate-[marquee_30s_linear_infinite] px-4">
          {latestNotice ? (
            <>
              <span className="mx-8 font-bold">{t(latestNotice.title)} ({latestNotice.date})</span>
              <span className="mx-8 font-medium">|</span>
              <span className="mx-8 font-bold">{t(settings.name)}{t(TRANSLATIONS.ui.welcome)}</span>
              <span className="mx-8 font-medium">|</span>
              <span className="mx-8 font-bold">{t(latestNotice.title)} ({latestNotice.date})</span>
              <span className="mx-8 font-medium">|</span>
              <span className="mx-8 font-bold">{t(settings.name)}{t(TRANSLATIONS.ui.welcome)}</span>
            </>
          ) : (
            <>
              <span className="mx-8 font-bold">{t(settings.name)}{t(TRANSLATIONS.ui.welcome)}</span>
              <span className="mx-8 font-bold">২০২৬ শিক্ষাবর্ষে ভর্তি চলছে...</span>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default NoticeTicker;
