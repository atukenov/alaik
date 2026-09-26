import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { withAffiliate } from './affiliate';

/**
 * Open an external store link: an in-app browser on native (Capacitor),
 * a new tab on the web. The URL is passed through affiliate tagging first.
 */
export async function openExternal(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const full = withAffiliate(url);
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: full });
  } else {
    window.open(full, '_blank', 'noopener,noreferrer');
  }
}
