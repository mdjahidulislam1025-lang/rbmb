import * as React from 'react';
import { X, Smartphone, Play } from 'lucide-react';
import { useApp } from '../App';
import {
  ADMOB_TEST_IDS,
  getTestBannerAdId,
  hideTestBanner,
  isNativeAdMobSupported,
  prepareAndShowTestInterstitial,
  resumeTestBanner,
  showTestBanner,
} from '../utils/admob';

interface AdMobBannerBarProps {
  onHeightChange?: (height: number) => void;
}

const AdMobBannerBar: React.FC<AdMobBannerBarProps> = ({ onHeightChange }) => {
  const { lang } = useApp();
  const nativeSupported = isNativeAdMobSupported();
  const [nativeBannerHeight, setNativeBannerHeight] = React.useState(0);
  const [webPreviewDismissed, setWebPreviewDismissed] = React.useState(false);
  const [interstitialNotice, setInterstitialNotice] = React.useState(false);

  React.useEffect(() => {
    if (!nativeSupported) return;

    let cleanupFn: (() => Promise<void>) | undefined;
    let mounted = true;

    const startNativeBanner = async () => {
      const cleanup = await showTestBanner((size) => {
        if (!mounted) return;
        const height = Math.max(0, Math.round(size.height || 0));
        setNativeBannerHeight(height);
        onHeightChange?.(height);
      });
      if (mounted) {
        cleanupFn = cleanup;
      } else {
        await cleanup();
      }
    };

    startNativeBanner();

    const handleBeforePrint = () => {
      void hideTestBanner();
    };
    const handleAfterPrint = () => {
      void resumeTestBanner();
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      mounted = false;
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      onHeightChange?.(0);
      if (cleanupFn) {
        void cleanupFn();
      }
    };
  }, [nativeSupported, onHeightChange]);

  const handlePreviewInterstitial = async () => {
    if (nativeSupported) {
      await prepareAndShowTestInterstitial();
      return;
    }
    setInterstitialNotice(true);
  };

  if (nativeSupported) {
    if (nativeBannerHeight <= 0) return null;
    return (
      <div
        aria-hidden="true"
        className="w-full shrink-0 no-print"
        style={{ height: `${nativeBannerHeight}px` }}
      />
    );
  }

  if (webPreviewDismissed) return null;

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2.5 px-4 no-print">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-500/40 bg-white dark:bg-slate-950 px-3.5 py-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/50 shrink-0">
              Test Ad
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'Google AdMob টেস্ট ব্যানার অ্যাড (Android APK)'
                    : 'Google AdMob Test Banner Ad (Android APK)'}
                </span>
              </p>
              <p className="text-[10px] font-mono-code text-slate-500 dark:text-slate-400 truncate">
                App ID: {ADMOB_TEST_IDS.androidAppId} · Banner: {getTestBannerAdId()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePreviewInterstitial}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <Play className="w-3 h-3" />
              {lang === 'bn' ? 'ইন্টারস্টিশিয়াল টেস্ট' : 'Test Interstitial'}
            </button>
            <button
              type="button"
              onClick={() => setWebPreviewDismissed(true)}
              aria-label={lang === 'bn' ? 'টেস্ট অ্যাড ব্যানার লুকান' : 'Hide test ad banner'}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {interstitialNotice && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                Google AdMob · Test Interstitial
              </span>
              <button
                type="button"
                onClick={() => setInterstitialNotice(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'AdMob টেস্ট অ্যাড সক্রিয় রয়েছে' : 'Google AdMob Test Mode Active'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? 'এটি ওয়েব প্রিভিউ মোড। Android APK বিল্ডে আসল Google AdMob টেস্ট ব্যানার ও ইন্টারস্টিশিয়াল অ্যাড প্রদর্শিত হবে।'
                  : 'Web browsers show this test preview. Real Google AdMob Adaptive Banner & Interstitial test ads display automatically inside the Android APK.'}
              </p>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-left font-mono-code text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div>App ID: {ADMOB_TEST_IDS.androidAppId}</div>
                <div>Banner: {ADMOB_TEST_IDS.banner.android}</div>
                <div>Interstitial: {ADMOB_TEST_IDS.interstitial.android}</div>
                <div>Rewarded: {ADMOB_TEST_IDS.rewarded.android}</div>
              </div>
              <button
                type="button"
                onClick={() => setInterstitialNotice(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdMobBannerBar;
