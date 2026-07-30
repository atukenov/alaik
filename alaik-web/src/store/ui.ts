import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'ru' | 'kz' | 'en';

interface UiState {
  lang: Lang;
  onboarded: boolean;
  // event slug -> per-event guest key, for anonymous reservations in this browser.
  // One key per event: it authorizes the guest's single reservation and its cancel.
  guestKeys: Record<string, string>;
  setLang: (lang: Lang) => void;
  cycleLang: () => void;
  setOnboarded: (v: boolean) => void;
  rememberGuestKey: (slug: string, key: string) => void;
  forgetGuestKey: (slug: string) => void;
}

const order: Lang[] = ['ru', 'kz', 'en'];

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      lang: 'ru',
      onboarded: false,
      guestKeys: {},
      setLang: (lang) => set({ lang }),
      cycleLang: () => {
        const cur = get().lang;
        set({ lang: order[(order.indexOf(cur) + 1) % order.length] });
      },
      setOnboarded: (onboarded) => set({ onboarded }),
      rememberGuestKey: (slug, key) =>
        set((s) => ({ guestKeys: { ...s.guestKeys, [slug]: key } })),
      forgetGuestKey: (slug) =>
        set((s) => {
          const next = { ...s.guestKeys };
          delete next[slug];
          return { guestKeys: next };
        }),
    }),
    { name: 'alaik-ui' },
  ),
);
