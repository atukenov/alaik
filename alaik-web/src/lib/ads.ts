import { Capacitor } from '@capacitor/core';

// Google's official TEST ad units — always serve safe test ads (incl. Simulator).
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

// Ad unit ids come from env (set in .env.production). Until a real one is set we
// fall back to Google's test unit so ads are visible while developing.
function bannerId(): string {
  const ios = Capacitor.getPlatform() === 'ios';
  const real = ios
    ? (import.meta.env.VITE_ADMOB_IOS_BANNER as string | undefined)
    : (import.meta.env.VITE_ADMOB_ANDROID_BANNER as string | undefined);
  return real || (ios ? TEST_BANNER_IOS : TEST_BANNER_ANDROID);
}

// True while we're serving Google's test unit (no real id configured yet).
function usingTestAds(): boolean {
  const ios = Capacitor.getPlatform() === 'ios';
  return !(ios ? import.meta.env.VITE_ADMOB_IOS_BANNER : import.meta.env.VITE_ADMOB_ANDROID_BANNER);
}

/** Initialize AdMob once on native at startup (also prompts ATT on iOS). */
export async function initAds(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import('@capacitor-community/admob');
  await AdMob.initialize({ initializeForTesting: usingTestAds() });
}

export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
  await AdMob.showBanner({
    adId: bannerId(),
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: usingTestAds(),
  }).catch(() => {});
}

export async function hideBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import('@capacitor-community/admob');
  await AdMob.hideBanner().catch(() => {});
  await AdMob.removeBanner().catch(() => {});
}
