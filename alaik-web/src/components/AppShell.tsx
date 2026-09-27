import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../lib/i18n';
import { ListsIcon, PlusIcon, ProfileIcon } from './Icons';

interface AppShellProps {
  children: ReactNode;
  tab?: 'lists' | 'profile';
}

/**
 * Centered mobile column. Full-bleed on phones (and inside the Capacitor
 * WebView); a rounded, shadowed card centered on tablet/desktop.
 */
export function AppShell({ children, tab }: AppShellProps) {
  return (
    <div className="min-h-dvh flex justify-center sm:items-start">
      {/* padding-bottom reserves space for the native ad banner (0 when none). */}
      <div
        className="relative flex w-full max-w-[430px] h-dvh flex-col overflow-hidden bg-bg text-text sm:my-6 sm:h-[calc(100dvh-3rem)] sm:rounded-[32px] sm:border sm:border-line sm:shadow-2xl"
        style={{ paddingBottom: 'var(--ad-banner-h, 0px)' }}
      >
        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
        {tab && <TabBar active={tab} />}
      </div>
    </div>
  );
}

function TabBar({ active }: { active: 'lists' | 'profile' }) {
  const t = useT();
  const nav = useNavigate();
  const color = (name: string) => (active === name ? 'text-accent' : 'text-muted');

  return (
    <div
      className="flex flex-none items-start border-t border-line bg-white/90 px-6 pt-1.5 backdrop-blur-md"
      style={{ height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        onClick={() => nav('/lists')}
        className={`tapc flex flex-1 flex-col items-center gap-0.5 pt-1.5 ${color('lists')}`}
      >
        <ListsIcon />
        <span className="text-[10px] font-semibold">{t.tabLists}</span>
      </button>

      <div className="flex w-14 flex-none justify-center">
        <button
          onClick={() => nav('/create')}
          className="tapc -mt-3.5 flex h-[50px] w-[50px] items-center justify-center rounded-pill bg-primary-135 text-white shadow-fab"
          aria-label="create"
        >
          <PlusIcon />
        </button>
      </div>

      <button
        onClick={() => nav('/profile')}
        className={`tapc flex flex-1 flex-col items-center gap-0.5 pt-1.5 ${color('profile')}`}
      >
        <ProfileIcon />
        <span className="text-[10px] font-semibold">{t.tabProfile}</span>
      </button>
    </div>
  );
}
