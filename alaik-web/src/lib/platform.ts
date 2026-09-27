import { Capacitor } from '@capacitor/core';

/**
 * Runtime target.
 * - Native (Capacitor iOS/Android): the full owner app — onboarding, auth,
 *   creating events, lists, profile — plus the guest view.
 * - Web (browser, e.g. the Vercel deploy): GUEST-ONLY. Only shared event
 *   links (`/e/:slug`) are reachable; there is no login/registration/profile.
 */
export const isNative = Capacitor.isNativePlatform();
export const isWeb = !isNative;
