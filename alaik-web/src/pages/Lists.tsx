import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useT, typeLabel } from '../lib/i18n';
import { useAuth } from '../store/auth';
import { useUi } from '../store/ui';
import { coverStyle, formatDate } from '../lib/format';
import { AppShell } from '../components/AppShell';
import { ProgressBar, TypeChip, Placeholder } from '../components/ui';
import { BellIcon } from '../components/Icons';
import type { EventSummary } from '../lib/types';

export default function Lists() {
  const t = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const lang = useUi((s) => s.lang);
  const user = useAuth((s) => s.user);
  const [seg, setSeg] = useState<'mine' | 'reserved'>('mine');
  const [showNotifs, setShowNotifs] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', seg],
    queryFn: () => api.listEvents(seg),
  });

  const { data: notifs = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 30_000,
  });
  const unread = notifs.filter((n) => !n.isRead).length;

  const markRead = useMutation({
    mutationFn: () => api.markNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const openNotifs = () => {
    setShowNotifs(true);
    if (unread > 0) markRead.mutate();
  };

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <AppShell tab="lists">
      <div className="animate-fadein px-5 pb-6 pt-1.5">
        <div className="flex items-center justify-between py-1.5 pb-4">
          <h1 className="min-w-0 truncate pr-2 text-2xl font-extrabold">
            {t.hi.replace('{name}', firstName)}
          </h1>
          <div className="flex flex-none items-center gap-2.5">
            <button
              onClick={openNotifs}
              className="tapc relative flex h-[42px] w-[42px] items-center justify-center rounded-pill bg-card2 text-text"
              aria-label={t.notifTitle}
            >
              <BellIcon size={20} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            <Placeholder label="фото" className="h-[42px] w-[42px] rounded-pill" />
          </div>
        </div>

        <div className="mb-[18px] flex gap-1.5 rounded-pill bg-card2 p-[5px]">
          <Segment active={seg === 'mine'} onClick={() => setSeg('mine')}>
            {t.segMine}
          </Segment>
          <Segment active={seg === 'reserved'} onClick={() => setSeg('reserved')}>
            {t.segReserved}
          </Segment>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted">…</div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">
            {seg === 'mine' ? t.empty : t.emptyReserved}
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {events.map((e) => (
              <EventCard
                key={e.id}
                e={e}
                mine={seg === 'mine'}
                lang={lang}
                onOpen={() => nav(seg === 'mine' ? `/event/${e.id}` : `/e/${e.slug}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showNotifs && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
          onClick={() => setShowNotifs(false)}
        >
          <div
            className="max-h-[70%] w-full max-w-[430px] animate-fadein overflow-y-auto rounded-t-[28px] bg-bg p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h2 className="mb-4 text-lg font-extrabold">{t.notifTitle}</h2>
            {notifs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">{t.notifEmpty}</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-gift border border-line bg-card p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 min-w-[30px] items-center justify-center rounded-pill bg-primary px-1.5 text-[11px] font-bold text-white">
                        {n.threshold}%
                      </span>
                      <span className="truncate text-sm font-bold">{n.eventTitle}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] text-muted">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`tapc flex-1 rounded-pill py-[9px] text-[13px] font-semibold transition-colors ${
        active ? 'bg-card text-text shadow-[0_2px_6px_rgba(120,60,40,0.12)]' : 'text-muted'
      }`}
    >
      {children}
    </button>
  );
}

function EventCard({
  e,
  mine,
  lang,
  onOpen,
}: {
  e: EventSummary;
  mine: boolean;
  lang: 'ru' | 'kz' | 'en';
  onOpen: () => void;
}) {
  const t = useT();
  const pct = mine
    ? e.totalItems > 0
      ? Math.round((e.coveredItems / e.totalItems) * 100)
      : 0
    : 100;
  const sub = mine
    ? `${e.coveredItems} ${t.itemsW} ${t.closedW} · ${e.totalItems}`
    : `${e.reservedByMe ?? 0} ${t.reservedByYou}`;

  return (
    <button
      onClick={onOpen}
      className="tapc overflow-hidden rounded-card border border-line bg-card text-left shadow-event"
    >
      <div className="flex h-[104px] items-end p-3" style={coverStyle(e.type)}>
        <TypeChip label={typeLabel(t, e.type)} />
      </div>
      <div className="px-[15px] pb-[15px] pt-[13px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base font-bold leading-tight">{e.title}</span>
          <span className="whitespace-nowrap text-xs font-medium text-muted">
            {formatDate(e.eventDate, lang, true)}
          </span>
        </div>
        <ProgressBar pct={pct} className="mt-[11px] !h-[7px]" />
        <div className="mt-2 text-xs font-medium text-muted">{sub}</div>
      </div>
    </button>
  );
}
