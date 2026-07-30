import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useT, typeLabel } from '../lib/i18n';
import { formatDate, formatPrice } from '../lib/format';
import { useUi } from '../store/ui';
import { useAuth } from '../store/auth';
import { AppShell } from '../components/AppShell';
import { ProgressBar, TypeChip, Placeholder } from '../components/ui';
import { BackIcon, GiftIcon, ShareIcon } from '../components/Icons';
import { shareLink } from '../lib/share';
import { openExternal } from '../lib/browser';
import { ApiError } from '../lib/api';
import type { GuestItem } from '../lib/types';

export default function Guest() {
  const t = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { slug = '' } = useParams();
  const lang = useUi((s) => s.lang);
  const guestKey = useUi((s) => s.guestKeys[slug]);
  const { rememberGuestKey, forgetGuestKey } = useUi();
  const isAuthed = !!useAuth((s) => s.accessToken);
  const [toast, setToast] = useState('');

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const { data: ev, isLoading } = useQuery({
    queryKey: ['guest', slug, guestKey],
    queryFn: () => api.getGuestEvent(slug, guestKey),
  });

  const reserve = useMutation({
    mutationFn: (item: GuestItem) => api.reserve(item.id, undefined, guestKey),
    onSuccess: (res) => {
      if (res.guestToken) rememberGuestKey(slug, res.guestToken);
      qc.invalidateQueries({ queryKey: ['guest', slug] });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        const code = (err.body as { error?: string } | null)?.error;
        flash(code === 'event_limit' ? t.limitReached : t.alreadyTaken);
      }
    },
  });

  const cancel = useMutation({
    mutationFn: (item: GuestItem) => api.cancelReserve(item.id, guestKey),
    onSuccess: () => {
      forgetGuestKey(slug);
      qc.invalidateQueries({ queryKey: ['guest', slug] });
    },
  });

  const share = async () => {
    const url = `${window.location.origin}/e/${slug}`;
    const copied = await shareLink(ev?.title ?? 'Alaik', url);
    if (copied) flash(t.linkCopied);
  };

  if (isLoading || !ev) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-muted">…</div>
      </AppShell>
    );
  }

  // The guest may hold at most one reservation per event. Once they have one,
  // other free items are shown but not reservable.
  const hasMine = ev.items.some((i) => i.reservedByMe);

  return (
    <AppShell>
      <div className="animate-fadein relative min-h-full pb-24">
        <div
          className="relative flex h-[196px] flex-col justify-between p-4 pb-4"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg,rgba(224,102,79,.08) 0 10px,transparent 10px 20px),linear-gradient(0deg,#f6e6df,#f6e6df)',
          }}
        >
          <button
            onClick={() => (isAuthed ? nav(-1) : nav('/onboarding'))}
            className="tapc flex h-10 w-10 items-center justify-center rounded-pill bg-white/70 backdrop-blur"
          >
            <BackIcon />
          </button>
          <span className="absolute right-[18px] top-4 h-[13px] w-[13px] rotate-45 bg-accent2" />
          <div>
            <TypeChip label={typeLabel(t, ev.type)} />
            <h1 className="mb-1 mt-2.5 text-[27px] font-extrabold leading-none">{ev.title}</h1>
            <p className="text-[13px] font-medium text-muted">
              {formatDate(ev.eventDate, lang)} · {t.gFrom} {ev.ownerName}
            </p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="rounded-card border border-line bg-card p-[15px] px-[17px] shadow-guest">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{t.chosen}</span>
              <span className="text-[15px] font-extrabold text-accent">
                {ev.chosenItems} / {ev.totalItems}
              </span>
            </div>
            <ProgressBar
              pct={ev.totalItems > 0 ? Math.round((ev.chosenItems / ev.totalItems) * 100) : 0}
              className="mt-2.5"
            />
          </div>

          <div className="mx-1 mb-3 mt-5 flex items-center justify-between gap-2">
            <h2 className="section-label">{t.gifts}</h2>
            <span className="text-[11px] font-medium text-muted">
              {hasMine ? t.oneChosen : t.oneOnly}
            </span>
          </div>

          <div className="flex flex-col gap-[11px]">
            {ev.items.map((it) => {
              const mine = it.reservedByMe;
              return (
                <div
                  key={it.id}
                  className={`flex gap-3 rounded-gift border border-line bg-card p-3 ${
                    it.isReserved ? 'opacity-[0.62]' : ''
                  }`}
                >
                  <button
                    onClick={() => openExternal(it.purchaseLink)}
                    disabled={!it.purchaseLink}
                    className={`relative h-16 w-16 flex-none ${it.purchaseLink ? 'tapc' : ''}`}
                    aria-label={it.purchaseLink ? t.openStore : undefined}
                  >
                    <Placeholder
                      icon={<GiftIcon size={26} />}
                      src={it.imageUrl}
                      className="h-16 w-16 rounded-2xl"
                    />
                    {it.isReserved && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/40 text-[22px] font-extrabold text-accent">
                        ✓
                      </span>
                    )}
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <button
                      onClick={() => openExternal(it.purchaseLink)}
                      disabled={!it.purchaseLink}
                      className={`text-left text-sm font-semibold leading-tight ${
                        it.purchaseLink ? 'tapc' : ''
                      }`}
                    >
                      {it.title}
                    </button>
                    {it.store && (
                      <button
                        onClick={() => openExternal(it.purchaseLink)}
                        disabled={!it.purchaseLink}
                        className={`mt-0.5 text-left text-[11px] font-medium ${
                          it.purchaseLink ? 'text-accent underline underline-offset-2 tapc' : 'text-muted'
                        }`}
                      >
                        {it.store}
                      </button>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-[9px]">
                      <span className="text-sm font-extrabold">
                        {formatPrice(it.price, it.currency)}
                      </span>
                      {!it.isReserved ? (
                        <button
                          onClick={() => reserve.mutate(it)}
                          disabled={hasMine || reserve.isPending}
                          title={hasMine ? t.oneOnly : undefined}
                          className={
                            hasMine
                              ? 'cursor-not-allowed rounded-pill bg-card2 px-4 py-[9px] text-xs font-bold text-muted'
                              : 'tapc rounded-pill bg-accent px-4 py-[9px] text-xs font-bold text-white'
                          }
                        >
                          {t.reserve}
                        </button>
                      ) : mine ? (
                        <button
                          onClick={() => cancel.mutate(it)}
                          disabled={cancel.isPending}
                          className="tapc text-xs font-bold text-muted"
                        >
                          {t.reserved} · {t.cancel}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-muted">{t.reserved}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg from-[66%] to-transparent p-4 pb-6">
          <button onClick={share} className="btn-primary !h-[52px]">
            <ShareIcon />
            {t.shareList}
          </button>
        </div>

        {toast && (
          <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-text px-4 py-2 text-[13px] font-medium text-white">
            {toast}
          </div>
        )}
      </div>
    </AppShell>
  );
}
