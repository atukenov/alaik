import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { maybeShowInterstitial } from './ads';

/**
 * Periodic full-screen ads for free users.
 *
 * Rather than a raw timer (which would interrupt a user mid-screen and is
 * discouraged by AdMob), we try to show an interstitial on each screen
 * transition. `maybeShowInterstitial` enforces the time cap, so in practice one
 * appears at the first navigation after the interval elapses — i.e. periodically
 * as the app is used. Skipped for premium users, on the public guest page, and
 * on the very first screen after launch.
 */
export function useInterstitialCadence() {
  const location = useLocation();
  const isPremium = useAuth((s) => !!s.user?.isPremium);
  const firstRender = useRef(true);

  useEffect(() => {
    // Never interrupt the launch screen — only fire on later transitions.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // The public guest link must stay ad-free.
    if (location.pathname.startsWith('/e/')) return;

    void maybeShowInterstitial(isPremium);
  }, [location.pathname, isPremium]);
}
