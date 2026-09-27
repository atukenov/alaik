import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { isNative } from './platform';

/**
 * Route incoming Universal Links / deep links into the app's own router.
 *
 * When someone taps a shared guest link (https://<web>/e/<slug>) and the app is
 * installed, iOS opens the app and fires `appUrlOpen` with the full URL instead
 * of sending it to the browser. We take the path and hand it to React Router so
 * the in-app screen shows (the owner still goes through the app's normal auth;
 * the public /e/:slug route needs none). No-op on the web.
 */
export function useDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative) return;

    let remove: (() => void) | undefined;
    void App.addListener('appUrlOpen', ({ url }) => {
      try {
        const { pathname, search, hash } = new URL(url);
        if (pathname) navigate(`${pathname}${search}${hash}`);
      } catch {
        /* ignore malformed URLs */
      }
    }).then((handle) => {
      remove = () => void handle.remove();
    });

    return () => remove?.();
  }, [navigate]);
}
