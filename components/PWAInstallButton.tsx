import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../App';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { lang } = useApp();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          variant === 'full'
            ? 'w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl text-base font-black bg-yellow-400 text-green-950 hover:bg-yellow-500 shadow-lg transition-all active:scale-95'
            : 'flex items-center gap-2 rounded-full bg-green-700 px-3.5 py-1.5 text-xs font-black text-white shadow-md hover:bg-green-800 transition-all active:scale-95'
        }
        title={lang === 'bn' ? 'অ্যান্ড্রয়েড/মোবাইল অ্যাপ ইনস্টল করুন' : 'Install Mobile App'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{lang === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'full'
              ? 'w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl text-base font-black border-2 border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 transition-all'
              : 'flex items-center gap-1.5 rounded-full border border-green-600 px-3 py-1.5 text-xs font-black text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 transition-all'
          }
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-green-900 dark:text-white">
                  {lang === 'bn' ? 'iPhone / iPad-এ ইনস্টল করুন' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium list-decimal list-inside">
                <li>
                  {lang === 'bn'
                    ? 'Safari ব্রাউজারের নিচের Share বাটনে ট্যাপ করুন।'
                    : 'Tap the Share button in the Safari toolbar.'}
                </li>
                <li>
                  {lang === 'bn'
                    ? 'নিচে স্ক্রল করে "Add to Home Screen" নির্বাচন করুন।'
                    : 'Scroll down and tap "Add to Home Screen".'}
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-green-700 py-3 text-sm font-black text-white hover:bg-green-800 transition-all"
              >
                {lang === 'bn' ? 'বুঝেছি' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
