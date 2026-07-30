import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Open an external store link: an in-app browser on native (Capacitor),
 * a new tab on the web.
 */
export async function openExternal(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: full });
  } else {
    window.open(full, '_blank', 'noopener,noreferrer');
  }
}
