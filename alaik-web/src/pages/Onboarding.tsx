import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../lib/i18n';
import { useUi } from '../store/ui';
import { AppShell } from '../components/AppShell';

export default function Onboarding() {
  const t = useT();
  const nav = useNavigate();
  const { lang, cycleLang, setOnboarded } = useUi();
  const [step, setStep] = useState(0);
  const last = step >= 2;
  const langLabel = lang.toUpperCase();

  const finish = () => {
    setOnboarded(true);
    nav('/auth');
  };

  return (
    <AppShell>
      <div className="animate-fadein flex min-h-full flex-col px-6 pb-8 pt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <button
            onClick={cycleLang}
            className="tapc rounded-pill bg-card2 px-3 py-1.5 text-[11px] font-bold"
          >
            {langLabel}
          </button>
          <button onClick={finish} className="tapc text-[13px] font-semibold text-muted">
            {t.skip}
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6">
          <div
            className="relative flex aspect-square items-center justify-center rounded-[32px]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg,rgba(224,102,79,.1) 0 12px,transparent 12px 24px),linear-gradient(160deg,#f9e3db,#f4d3c6)',
            }}
          >
            <span className="font-mono text-[11px] text-muted">иллюстрация</span>
            <span className="absolute right-[18px] top-[18px] h-4 w-4 rotate-45 bg-accent2" />
          </div>
          <div>
            <h1 className="mb-3 text-[27px] font-extrabold leading-[1.08]">
              {t.ob[step].t}
            </h1>
            <p className="text-[15px] leading-[1.5] text-muted">{t.ob[step].d}</p>
          </div>
        </div>

        <div className="my-5 flex justify-center gap-[7px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-[7px] rounded-pill transition-all duration-200"
              style={{
                width: i === step ? '22px' : '7px',
                background: i === step ? '#e0664f' : '#f6e6df',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => (last ? finish() : setStep(step + 1))}
          className="btn-primary"
        >
          {last ? t.start : t.next}
        </button>
      </div>
    </AppShell>
  );
}
