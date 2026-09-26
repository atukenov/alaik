import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useT } from '../lib/i18n';

/**
 * Free-tier ad slot. Hidden for Alaik Plus subscribers.
 *
 * Today it renders a house "remove ads" promo placeholder. To ship real ads,
 * drop the AdMob banner here (e.g. @capacitor-community/admob) behind the same
 * `isPremium` guard, and keep it OFF the public guest page.
 */
export function AdBanner() {
  const t = useT();
  const nav = useNavigate();
  const isPremium = useAuth((s) => !!s.user?.isPremium);
  if (isPremium) return null;

  return (
    <button
      onClick={() => nav('/plus')}
      className="tapc mt-3 flex w-full items-center justify-between gap-3 rounded-gift border border-dashed border-line bg-card2/60 px-4 py-3 text-left"
    >
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          {t.adLabel}
        </div>
        <div className="mt-0.5 truncate text-[13px] font-semibold text-text">
          {t.adRemove}
        </div>
      </div>
      <span className="flex-none rounded-pill bg-primary px-3 py-1.5 text-[12px] font-bold text-white">
        {t.plusCta}
      </span>
    </button>
  );
}
