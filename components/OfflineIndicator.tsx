import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useApp } from '../App';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { lang } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-xl no-print">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {lang === 'bn'
          ? 'অফলাইন মোড — সংরক্ষিত তথ্য দেখানো হচ্ছে'
          : 'Offline Mode — Cached data is being used.'}
      </span>
    </div>
  );
};
