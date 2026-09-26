import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useT } from '../lib/i18n';
import { useAuth } from '../store/auth';
import { AppShell } from '../components/AppShell';
import { BackIcon } from '../components/Icons';

// Real StoreKit / RevenueCat purchase drops in here on device. In the browser /
// dev we call the dev-upgrade endpoint so the premium experience is testable.
const IS_DEV = import.meta.env.DEV;

export default function Plus() {
  const t = useT();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const reason = params.get('reason'); // e.g. free_limit_events
  const { user, setUser } = useAuth();
  const [done, setDone] = useState(false);

  const subscribe = useMutation({
    mutationFn: async () => {
      if (IS_DEV) return api.devUpgrade();
      // TODO: trigger the native purchase (StoreKit via RevenueCat) here.
      throw new Error('billing_not_configured');
    },
    onSuccess: (res) => {
      if (user) setUser({ ...user, isPremium: res.isPremium, premiumUntil: res.premiumUntil });
      setDone(true);
    },
  });

  const benefits = [t.plusB1, t.plusB2, t.plusB3, t.plusB4, t.plusB5];
  const active = !!user?.isPremium;

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
            <h1 className="text-2xl font-extrabold leading-tight">Alaik Plus</h1>
            <p className="text-[13px] font-medium text-muted">{t.plusTagline}</p>
          </div>
        </div>

        {reason && !active && (
          <div className="mt-4 rounded-gift bg-card2 px-4 py-3 text-[13px] font-medium text-text">
            {reason === 'free_limit_events' ? t.limitEvents : reason === 'free_limit_gifts' ? t.limitGifts : t.plusTagline}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
                ✓
              </span>
              <span className="text-[15px] text-text">{b}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-8">
          {active || done ? (
            <div className="rounded-card bg-card2 px-4 py-5 text-center">
              <div className="text-[15px] font-bold text-text">{t.plusActive}</div>
              {IS_DEV && (
                <button
                  onClick={async () => {
                    await api.devDowngrade();
                    if (user) setUser({ ...user, isPremium: false, premiumUntil: null });
                    setDone(false);
                  }}
                  className="tapc mt-2 text-[12px] font-medium text-muted underline"
                >
                  dev: turn off
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3 text-center text-[13px] text-muted">{t.plusPrice}</div>
              <button
                onClick={() => subscribe.mutate()}
                disabled={subscribe.isPending}
                className="btn-primary"
              >
                {t.plusSubscribe}
              </button>
              {subscribe.isError && (
                <p className="mt-3 text-center text-[12px] text-accent">{t.plusNotReady}</p>
              )}
              <p className="mt-3 text-center text-[11px] leading-[1.5] text-muted">
                {t.plusLegal}
              </p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
