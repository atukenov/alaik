import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../lib/i18n';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../store/auth';
import { AppShell } from '../components/AppShell';
import { BackIcon } from '../components/Icons';

export default function Auth() {
  const t = useT();
  const nav = useNavigate();
  const setSession = useAuth((s) => s.setSession);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError(t.errEmail);
      return;
    }
    if (password.length < 6) {
      setError(t.errPassword);
      return;
    }
    setBusy(true);
    try {
      const res = isRegister
        ? await api.register(name.trim(), email.trim(), password)
        : await api.login(email.trim(), password);
      setSession(res);
      nav('/lists', { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        const code = (e.body as { error?: string } | null)?.error;
        if (code === 'email_taken') setError(t.errEmailTaken);
        else if (code === 'invalid_credentials') setError(t.errCredentials);
        else setError(t.errGeneric);
      } else {
        setError(t.errGeneric);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="animate-fadein flex min-h-full flex-col px-6 pb-8 pt-4">
        <button
          onClick={() => nav('/onboarding')}
          className="tapc flex h-10 w-10 items-center justify-center rounded-pill bg-card2"
        >
          <BackIcon />
        </button>

        <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-135 text-[22px] font-extrabold text-white">
          a
        </div>

        <h1 className="mb-2 mt-5 text-2xl font-extrabold leading-tight">
          {isRegister ? t.registerTitle : t.loginTitle}
        </h1>
        <p className="mb-6 text-sm leading-[1.5] text-muted">
          {isRegister ? t.registerSub : t.loginSub}
        </p>

        {isRegister && (
          <>
            <label className="mb-1.5 text-xs font-semibold text-muted">{t.fName}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Аяна"
              className="field mb-4 h-[54px]"
            />
          </>
        )}

        <label className="mb-1.5 text-xs font-semibold text-muted">{t.fEmail}</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          type="email"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="email"
          placeholder="you@example.com"
          className="field mb-4 h-[54px]"
        />

        <label className="mb-1.5 text-xs font-semibold text-muted">{t.fPassword}</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          type="password"
          placeholder="••••••"
          className="field h-[54px]"
        />

        {error && <p className="mt-3 text-[13px] text-accent">{error}</p>}

        <button onClick={submit} disabled={busy} className="btn-primary mt-6">
          {isRegister ? t.registerCta : t.loginCta}
        </button>

        <button
          onClick={() => {
            setMode(isRegister ? 'login' : 'register');
            setError('');
          }}
          className="tapc mt-4 text-center text-[13px] font-medium text-muted"
        >
          {isRegister ? t.haveAccount : t.noAccount}{' '}
          <span className="font-semibold text-accent">
            {isRegister ? t.loginCta : t.registerCta}
          </span>
        </button>
      </div>
    </AppShell>
  );
}
