import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useT } from '../lib/i18n';
import { useAuth } from '../store/auth';
import { purchaseTier, restore } from '../lib/billing';
import { api } from '../lib/api';
import { AppShell } from '../components/AppShell';
import { BackIcon } from '../components/Icons';

type PaidTier = 'Plus' | 'Max';
const IS_DEV = import.meta.env.DEV;

export default function Plus() {
  const t = useT();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const reason = params.get('reason');
  const { user, setUser } = useAuth();
  const [selected, setSelected] = useState<PaidTier>('Plus');

  const currentTier = user?.tier ?? 'Free';
  const perks = [t.plusB1, t.plusB3, t.plusB4, t.plusB5];

  const subscribe = useMutation({
    mutationFn: () => purchaseTier(selected, user!.id),
    onSuccess: (tier) => {
      if (user) setUser({ ...user, tier, isPremium: tier !== 'Free' });
    },
  });

  const restoreM = useMutation({
    mutationFn: () => restore(user!.id),
    onSuccess: (tier) => {
      if (user) setUser({ ...user, tier, isPremium: tier !== 'Free' });
    },
  });

  const plans: { tier: PaidTier; name: string; desc: string; price: string }[] = [
    { tier: 'Plus', name: t.planPlus, desc: t.planPlusDesc, price: t.planPlusPrice },
    { tier: 'Max', name: t.planMax, desc: t.planMaxDesc, price: t.planMaxPrice },
  ];

  return (
    <AppShell>
      <div className="animate-fadein flex min-h-full flex-col px-6 pb-8 pt-4">
        <button
          onClick={() => nav(-1)}
          className="tapc flex h-10 w-10 items-center justify-center rounded-pill bg-card2"
        >
          <BackIcon />
        </button>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary-135 text-2xl">
            ✨
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{t.premiumTitle}</h1>
            <p className="text-[13px] font-medium text-muted">
              {currentTier === 'Free' ? t.plusTagline : `${t.currentTierLabel}: ${currentTier}`}
            </p>
          </div>
        </div>

        {reason && currentTier !== 'Max' && (
          <div className="mt-4 rounded-gift bg-card2 px-4 py-3 text-[13px] font-medium text-text">
            {reason === 'free_limit_events' ? t.limitEvents : t.limitGifts}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {plans.map((p) => {
            const isActive = selected === p.tier;
            const owned = currentTier === p.tier;
            return (
              <button
                key={p.tier}
                onClick={() => setSelected(p.tier)}
                className="tapc flex items-center gap-3 rounded-card border-2 bg-card p-4 text-left"
                style={{ borderColor: isActive ? '#e0664f' : 'rgba(58,42,40,0.08)' }}
              >
                <span
                  className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: isActive ? '#e0664f' : '#d9c7c0',
                    background: isActive ? '#e0664f' : 'transparent',
                  }}
                >
                  {isActive && <span className="text-[11px] font-bold text-white">✓</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-extrabold">{p.name}</span>
                    {owned && (
                      <span className="rounded-pill bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-muted">{p.desc}</div>
                </div>
                <div className="flex-none text-[14px] font-extrabold text-accent">{p.price}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {perks.map((b) => (
            <div key={b} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-card2 text-[11px] font-bold text-accent">
                ✓
              </span>
              <span className="text-[13px] text-text">{b}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <button
            onClick={() => subscribe.mutate()}
            disabled={subscribe.isPending || currentTier === selected}
            className="btn-primary"
          >
            {currentTier === selected ? t.plusActive : t.subscribeCta}
          </button>
          {subscribe.isError && (
            <p className="mt-3 text-center text-[12px] text-accent">{t.plusNotReady}</p>
          )}

          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => restoreM.mutate()}
              className="tapc text-[12px] font-medium text-muted"
            >
              {t.restoreCta}
            </button>
            {IS_DEV && currentTier !== 'Free' && (
              <button
                onClick={async () => {
                  await api.devSetTier('Free');
                  if (user) setUser({ ...user, tier: 'Free', isPremium: false });
                }}
                className="tapc text-[12px] font-medium text-muted underline"
              >
                dev: reset to Free
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-[11px] leading-[1.5] text-muted">{t.plusLegal}</p>
        </div>
      </div>
    </AppShell>
  );
}
