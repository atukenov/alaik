import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

/**
 * Share a URL using the best channel available:
 *  - native share sheet inside Capacitor (iOS/Android),
 *  - Web Share API in mobile browsers,
 *  - clipboard copy as a fallback (returns true so the caller can show a toast).
 * Returns true when the link was copied to the clipboard (caller shows "copied").
 */
export async function shareLink(title: string, url: string): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    await Share.share({ title, url });
    return false;
  }
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return false;
    } catch {
      return false;
    }
  }
  await navigator.clipboard.writeText(url);
  return true;
}
