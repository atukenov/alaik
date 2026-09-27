import { Capacitor } from '@capacitor/core';

// AdMob ad unit ids come from env (set in .env.production):
//   VITE_ADMOB_IOS_BANNER, VITE_ADMOB_ANDROID_BANNER
function bannerId(): string | undefined {
  return Capacitor.getPlatform() === 'ios'
    ? (import.meta.env.VITE_ADMOB_IOS_BANNER as string | undefined)
    : (import.meta.env.VITE_ADMOB_ANDROID_BANNER as string | undefined);
}

/** Initialize AdMob once on native at startup (also prompts ATT on iOS). */
export async function initAds(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import('@capacitor-community/admob');
  await AdMob.initialize({ initializeForTesting: false });
}

export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const adId = bannerId();
  if (!adId) return;
  const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
  await AdMob.showBanner({
    adId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
  }).catch(() => {});
}

export async function hideBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import('@capacitor-community/admob');
  await AdMob.hideBanner().catch(() => {});
  await AdMob.removeBanner().catch(() => {});
}
