import { useUi } from '../store/ui';

/**
 * Shown for any non-guest route on the web. The web deploy is guest-only, so
 * we never expose onboarding / login / registration here — those live in the
 * mobile app. Guests only ever arrive via a direct `/e/:slug` link.
 */
const COPY = {
  ru: {
    title: 'Alaik',
    sub: 'Списки желаний к любому событию. Создавайте списки и делитесь ими — в приложении.',
    hint: 'Открыли ссылку на событие? Она откроется автоматически. Чтобы создать свой список, установите приложение.',
    cta: 'Скачать в App Store',
  },
  kz: {
    title: 'Alaik',
    sub: 'Кез келген оқиғаға тілектер тізімі. Тізім жасап, бөлісіңіз — қосымшада.',
    hint: 'Оқиға сілтемесін аштыңыз ба? Ол автоматты түрде ашылады. Өз тізіміңізді жасау үшін қосымшаны орнатыңыз.',
    cta: 'App Store-дан жүктеу',
  },
  en: {
    title: 'Alaik',
    sub: 'Wishlists for any occasion. Create and share lists — in the app.',
    hint: 'Opened an event link? It loads automatically. To create your own list, install the app.',
    cta: 'Download on the App Store',
  },
} as const;

// TODO: replace with the real App Store listing URL once published.
const APP_STORE_URL = 'https://apps.apple.com/app/alaik/id0000000000';

export default function WebLanding() {
  const lang = useUi((s) => s.lang);
  const c = COPY[lang] ?? COPY.ru;

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-[430px] text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary-135 text-4xl shadow-fab">
          🎁
        </div>
        <h1 className="text-3xl font-extrabold text-text">{c.title}</h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.5] text-muted">{c.sub}</p>
        <p className="mx-auto mt-4 max-w-[340px] text-[13px] leading-[1.5] text-muted/80">{c.hint}</p>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mx-auto mt-8 max-w-[300px]"
        >
          {c.cta}
        </a>
      </div>
    </div>
  );
}
