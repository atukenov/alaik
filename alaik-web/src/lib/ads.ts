import { Capacitor } from '@capacitor/core';

// Google's official TEST ad units — always serve safe test ads (incl. Simulator).
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';

const isIos = () => Capacitor.getPlatform() === 'ios';

// Ad unit ids come from env (set in .env.production). Until a real one is set we
// fall back to Google's test unit so ads are visible while developing.
function bannerId(): string {
  const real = isIos()
    ? (import.meta.env.VITE_ADMOB_IOS_BANNER as string | undefined)
    : (import.meta.env.VITE_ADMOB_ANDROID_BANNER as string | undefined);
  return real || (isIos() ? TEST_BANNER_IOS : TEST_BANNER_ANDROID);
}

function interstitialId(): string {
  const real = isIos()
    ? (import.meta.env.VITE_ADMOB_IOS_INTERSTITIAL as string | undefined)
    : (import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL as string | undefined);
  return real || (isIos() ? TEST_INTERSTITIAL_IOS : TEST_INTERSTITIAL_ANDROID);
}

// Serve test ads when explicitly requested (VITE_ADS_TEST=true — use this on the
// Simulator / test devices so you never risk your AdMob account), or when no real
// ad unit ids are configured at all. Set VITE_ADS_TEST=false for production builds.
function testMode(): boolean {
  if ((import.meta.env.VITE_ADS_TEST as string | undefined) === 'true') return true;
  const anyReal =
    import.meta.env.VITE_ADMOB_IOS_BANNER ||
    import.meta.env.VITE_ADMOB_IOS_INTERSTITIAL ||
    import.meta.env.VITE_ADMOB_ANDROID_BANNER ||
    import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL;
  return !anyReal;
}

// The banner is a native overlay at the screen bottom. We publish its height to a
// CSS var so the app can reserve space and never let it cover the tab bar or a form.
function setBannerSpace(px: number): void {
  try {
    document.documentElement.style.setProperty('--ad-banner-h', `${Math.max(0, px)}px`);
  } catch {
    /* ignore */
  }
}

let sizeListenerAdded = false;

/** Initialize AdMob once on native at startup (also prompts ATT on iOS). */
export async function initAds(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob, BannerAdPluginEvents } = await import('@capacitor-community/admob');
  await AdMob.initialize({ initializeForTesting: testMode() });
  if (!sizeListenerAdded) {
    sizeListenerAdded = true;
    // Reserve exactly the banner's height whenever it (re)sizes.
    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: { height?: number }) => {
      setBannerSpace(info?.height ? Number(info.height) : 0);
    });
  }
}

export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
  await AdMob.showBanner({
    adId: bannerId(),
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: testMode(),
  }).catch(() => {});
}

export async function hideBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import('@capacitor-community/admob');
  await AdMob.hideBanner().catch(() => {});
  await AdMob.removeBanner().catch(() => {});
  setBannerSpace(0);
}

// ---- Interstitial (full-screen) ----
// Show at natural break points only, and no more than once every few minutes.
const INTERSTITIAL_MIN_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const LAST_KEY = 'alaik_last_interstitial';

function withinCap(): boolean {
  try {
    const last = Number(localStorage.getItem(LAST_KEY) || 0);
    return Date.now() - last < INTERSTITIAL_MIN_INTERVAL_MS;
  } catch {
    return false;
  }
}

/**
 * Show a full-screen interstitial at a natural transition, respecting a time cap.
 * No-op on web, for premium users, or if one was shown recently. The wait-then-close
 * countdown is controlled by AdMob, not the app.
 */
export async function maybeShowInterstitial(isPremium: boolean): Promise<void> {
  if (isPremium || !Capacitor.isNativePlatform() || withinCap()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareInterstitial({ adId: interstitialId(), isTesting: testMode() });
    await AdMob.showInterstitial();
    try {
      localStorage.setItem(LAST_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  } catch {
    /* ad failed to load — never block the user */
  }
}
