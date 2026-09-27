import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../store/auth';
import { useT } from '../lib/i18n';
import { showBanner, hideBanner } from '../lib/ads';

/**
 * Free-tier ad slot. Hidden for Alaik Plus / Max subscribers.
 * - On device (Capacitor): shows a real AdMob banner (native overlay).
 * - On web/dev: shows a house "remove ads" promo placeholder.
 * Keep this OFF the public guest page.
 */
export function AdBanner() {
  const t = useT();
  const nav = useNavigate();
  const isPremium = useAuth((s) => !!s.user?.isPremium);
  const native = Capacitor.isNativePlatform();

  useEffect(() => {
    if (native && !isPremium) {
      showBanner();
      return () => {
        hideBanner();
      };
    }
    if (native && isPremium) hideBanner();
  }, [native, isPremium]);

  if (isPremium) return null;
  if (native) return null; // the banner is a native overlay

  return (
    <button
      onClick={() => nav('/plus')}
      className="tapc mt-3 flex w-full items-center justify-between gap-3 rounded-gift border border-dashed border-line bg-card2/60 px-4 py-3 text-left"
    >
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          {t.adLabel}
        </div>
        <div className="mt-0.5 truncate text-[13px] font-semibold text-text">{t.adRemove}</div>
      </div>
      <span className="flex-none rounded-pill bg-primary px-3 py-1.5 text-[12px] font-bold text-white">
        {t.plusCta}
      </span>
    </button>
  );
}
