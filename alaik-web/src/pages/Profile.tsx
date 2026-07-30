import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useT } from '../lib/i18n';
import { useUi, type Lang } from '../store/ui';
import { useAuth } from '../store/auth';
import { AppShell } from '../components/AppShell';
import { Placeholder } from '../components/ui';
import { ChevronIcon, TrashIcon } from '../components/Icons';

const LANGS: [Lang, string][] = [
  ['ru', 'RU'],
  ['kz', 'KZ'],
  ['en', 'EN'],
];

export default function Profile() {
  const t = useT();
  const nav = useNavigate();
  const { lang, setLang } = useUi();
  const { user, logout } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: mine = [] } = useQuery({
    queryKey: ['events', 'mine'],
    queryFn: () => api.listEvents('mine'),
  });
  const { data: reserved = [] } = useQuery({
    queryKey: ['events', 'reserved'],
    queryFn: () => api.listEvents('reserved'),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteAccount(),
    onSuccess: () => {
      logout();
      nav('/onboarding', { replace: true });
    },
  });

  const rows = [
    { label: t.notif },
    { label: t.settings },
    { label: t.help },
    {
      label: t.logout,
      danger: true,
      onClick: () => {
        logout();
        nav('/onboarding', { replace: true });
      },
    },
  ];

  return (
    <AppShell tab="profile">
      <div className="animate-fadein px-5 pb-6 pt-2.5">
        <h1 className="mb-[18px] mt-1.5 text-2xl font-extrabold">{t.tabProfile}</h1>

        <div className="flex items-center gap-3.5 rounded-card border border-line bg-card p-4">
          <Placeholder label="фото" className="h-[58px] w-[58px] rounded-pill" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-bold">{user?.name ?? ''}</div>
            <div className="truncate text-[13px] font-medium text-muted">{user?.email ?? ''}</div>
          </div>
          <span className="text-[13px] font-semibold text-accent">{t.editP}</span>
        </div>

        <div className="my-3.5 flex gap-3">
          <Stat value={mine.length} label={t.pMyEvents} />
          <Stat value={reserved.length} label={t.pReserved} />
        </div>

        <div className="section-label mx-1 mb-2.5 mt-2">{t.language}</div>
        <div className="mb-[18px] flex gap-2">
          {LANGS.map(([code, label]) => {
            const active = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                className="tapc flex-1 rounded-field border-[1.5px] py-3 text-center text-[13px] font-bold"
                style={{
                  borderColor: active ? '#e0664f' : 'rgba(58,42,40,0.08)',
                  background: active ? '#e0664f' : '#fff',
                  color: active ? '#fff' : '#3a2a28',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-card">
          {rows.map((r, i) => (
            <button
              key={r.label}
              onClick={r.onClick}
              className={`tapc flex w-full items-center justify-between px-4 py-[15px] text-left ${
                i < rows.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <span
                className="text-sm font-medium"
                style={{ color: r.danger ? '#e0664f' : '#3a2a28' }}
              >
                {r.label}
              </span>
              <span className="text-muted">
                <ChevronIcon />
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setConfirmDelete(true)}
          className="tapc mt-4 flex w-full items-center justify-center gap-2 rounded-card border border-accent/30 py-[14px] text-sm font-semibold text-accent"
        >
          <TrashIcon size={16} />
          {t.deleteAccount}
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setConfirmDelete(false)}>
          <div
            className="w-full max-w-[430px] animate-fadein rounded-t-[28px] bg-bg p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h2 className="mb-2 text-lg font-extrabold">{t.deleteAccount}</h2>
            <p className="mb-5 text-sm leading-[1.5] text-muted">{t.deleteAccountConfirm}</p>
            <button
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              className="tapc mb-3 h-[52px] w-full rounded-pill bg-accent font-bold text-white disabled:opacity-50"
            >
              {t.confirmDelete}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="tapc h-11 w-full rounded-pill text-sm font-semibold text-muted"
            >
              {t.cancelBtn}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-[20px] border border-line bg-card px-4 py-3.5">
      <div className="text-2xl font-extrabold text-accent">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-muted">{label}</div>
    </div>
  );
}
