import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import { useT, typeLabel } from '../lib/i18n';
import { coverStyle } from '../lib/format';
import { AppShell } from '../components/AppShell';
import { TypeChip } from '../components/ui';
import { BackIcon } from '../components/Icons';
import { maybeShowInterstitial } from '../lib/ads';
import { useAuth } from '../store/auth';
import type { EventType } from '../lib/types';

const TYPES: EventType[] = ['Wedding', 'Birthday', 'BabyShower', 'Housewarming'];

export default function Wizard() {
  const t = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const isPremium = useAuth((s) => !!s.user?.isPremium);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<EventType>('Birthday');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const create = useMutation({
    mutationFn: () =>
      api.createEvent({ title: title.trim(), type, eventDate: date || null }),
    onSuccess: (ev) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      nav(`/event/${ev.id}`, { replace: true });
      // Full-screen ad at a natural completion moment (free tier, time-capped).
      void maybeShowInterstitial(isPremium);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 402) {
        const code = (err.body as { error?: string } | null)?.error ?? 'free_limit_events';
        nav(`/plus?reason=${code}`);
      }
    },
  });

  return (
    <AppShell>
      <div className="animate-fadein flex min-h-full flex-col px-[22px] pb-7 pt-3.5">
        <div className="mb-1.5 flex items-center gap-3">
          <button
            onClick={() => (step === 1 ? setStep(0) : nav('/lists'))}
            className="tapc flex h-10 w-10 items-center justify-center rounded-pill bg-card2"
          >
            <BackIcon />
          </button>
          <span className="text-[17px] font-bold">{t.wizTitle}</span>
        </div>

        <div className="my-3.5 mb-[22px] flex gap-1.5">
          <div className="h-[5px] flex-1 rounded-pill bg-accent" />
          <div className={`h-[5px] flex-1 rounded-pill ${step === 1 ? 'bg-accent' : 'bg-card2'}`} />
        </div>

        {step === 0 ? (
          <>
            <h2 className="mb-4 text-xl font-extrabold">{t.wizType}</h2>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map((k) => (
                <button
                  key={k}
                  onClick={() => setType(k)}
                  className="tapc overflow-hidden rounded-[20px] border-2 bg-card text-left"
                  style={{ borderColor: type === k ? '#e0664f' : 'transparent' }}
                >
                  <div className="h-[78px]" style={coverStyle(k)} />
                  <div className="px-3 py-[11px] text-[13px] font-semibold">
                    {typeLabel(t, k)}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="btn-primary mt-auto">
              {t.continue}
            </button>
          </>
        ) : (
          <>
            <div
              className="mb-[18px] flex h-[120px] items-end rounded-[20px] p-3"
              style={coverStyle(type)}
            >
              <TypeChip label={typeLabel(t, type)} />
            </div>
            <label className="text-xs font-semibold text-muted">{t.fTitle}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Данияру — 30!"
              className="field mb-4 mt-[7px] h-[52px]"
            />
            <label className="text-xs font-semibold text-muted">{t.fDate}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field mb-4 mt-[7px] h-[52px]"
            />
            <button
              onClick={() => create.mutate()}
              disabled={!title.trim() || create.isPending}
              className="btn-primary mt-auto"
            >
              {t.create2}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
