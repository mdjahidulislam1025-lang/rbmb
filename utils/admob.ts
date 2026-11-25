import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  type AdMobBannerSize,
} from '@capacitor-community/admob';

/**
 * Official Google AdMob Test IDs (never trigger invalid traffic; safe for development & QA).
 * Replace with production AdMob IDs from Google AdMob Console prior to Play Store release.
 */
export const ADMOB_TEST_IDS = {
  androidAppId: 'ca-app-pub-3940256099942544~3347511713',
  banner: {
    android: 'ca-app-pub-3940256099942544/9214589741', // Adaptive Banner
    androidStandard: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  },
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  },
  rewarded: {
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  },
} as const;

let initPromise: Promise<boolean> | null = null;

export const isNativeAdMobSupported = (): boolean => Capacitor.isNativePlatform();

export const getTestBannerAdId = (): string =>
  Capacitor.getPlatform() === 'ios' ? ADMOB_TEST_IDS.banner.ios : ADMOB_TEST_IDS.banner.android;

export const getTestInterstitialAdId = (): string =>
  Capacitor.getPlatform() === 'ios' ? ADMOB_TEST_IDS.interstitial.ios : ADMOB_TEST_IDS.interstitial.android;

export const getTestRewardedAdId = (): string =>
  Capacitor.getPlatform() === 'ios' ? ADMOB_TEST_IDS.rewarded.ios : ADMOB_TEST_IDS.rewarded.android;

export const ensureAdMobInitialized = async (): Promise<boolean> => {
  if (!isNativeAdMobSupported()) return false;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: true,
      });

      try {
        let consentInfo = await AdMob.requestConsentInfo();
        if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
          consentInfo = await AdMob.showConsentForm();
        }
        return consentInfo.canRequestAds !== false;
      } catch {
        // Fallback so test ads still load cleanly in regions or offline emulators where UMP is unavailable
        return true;
      }
    } catch {
      initPromise = null;
      return false;
    }
  })();

  return initPromise;
};

export const showTestBanner = async (
  onSizeChange?: (size: AdMobBannerSize) => void
): Promise<() => Promise<void>> => {
  if (!isNativeAdMobSupported()) {
    return async () => {};
  }

  const listeners: PluginListenerHandle[] = [];
  let active = true;

  if (onSizeChange) {
    try {
      const sizeHandle = await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
        if (active) onSizeChange(info);
      });
      listeners.push(sizeHandle);
    } catch {
      // Ignore listener setup failure on unsupported runtimes
    }
  }

  const ready = await ensureAdMobInitialized();
  if (ready && active) {
    try {
      await AdMob.showBanner({
        adId: getTestBannerAdId(),
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      });
    } catch {
      // Non-fatal in case device has no Google Play Services / ad fill
    }
  }

  return async () => {
    active = false;
    for (const handle of listeners) {
      try {
        await handle.remove();
      } catch {
        // ignore
      }
    }
    try {
      await AdMob.removeBanner();
    } catch {
      // ignore
    }
  };
};

export const hideTestBanner = async (): Promise<void> => {
  if (!isNativeAdMobSupported()) return;
  try {
    await AdMob.hideBanner();
  } catch {
    // ignore
  }
};

export const resumeTestBanner = async (): Promise<void> => {
  if (!isNativeAdMobSupported()) return;
  try {
    await AdMob.resumeBanner();
  } catch {
    // ignore
  }
};

export const prepareAndShowTestInterstitial = async (): Promise<boolean> => {
  if (!isNativeAdMobSupported()) return false;
  const ready = await ensureAdMobInitialized();
  if (!ready) return false;
  try {
    await AdMob.prepareInterstitial({
      adId: getTestInterstitialAdId(),
      isTesting: true,
    });
    await AdMob.showInterstitial();
    return true;
  } catch {
    return false;
  }
};

export const prepareAndShowTestRewarded = async (): Promise<boolean> => {
  if (!isNativeAdMobSupported()) return false;
  const ready = await ensureAdMobInitialized();
  if (!ready) return false;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: getTestRewardedAdId(),
      isTesting: true,
    });
    await AdMob.showRewardVideoAd();
    return true;
  } catch {
    return false;
  }
};
