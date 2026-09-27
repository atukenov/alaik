import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, type JSX } from 'react';
import { useAuth } from './store/auth';
import { useUi } from './store/ui';
import { hideBanner } from './lib/ads';
import { isWeb } from './lib/platform';
import { useDeepLinks } from './lib/deeplinks';
import { useInterstitialCadence } from './lib/interstitial';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Lists from './pages/Lists';
import Wizard from './pages/Wizard';
import Owner from './pages/Owner';
import Guest from './pages/Guest';
import Profile from './pages/Profile';
import Plus from './pages/Plus';
import WebLanding from './pages/WebLanding';

function RequireAuth({ children }: { children: JSX.Element }) {
  const authed = useAuth((s) => !!s.accessToken);
  return authed ? children : <Navigate to="/onboarding" replace />;
}

function Landing() {
  const authed = useAuth((s) => !!s.accessToken);
  const onboarded = useUi((s) => s.onboarded);
  if (authed) return <Navigate to="/lists" replace />;
  return <Navigate to={onboarded ? '/auth' : '/onboarding'} replace />;
}

/**
 * On the web the app is GUEST-ONLY: the only real screen is a shared event
 * link (`/e/:slug`). Onboarding, login, registration, lists and profile exist
 * solely in the mobile app, so we never mount those routes in a browser.
 */
function WebApp() {
  return (
    <Routes>
      <Route path="/e/:slug" element={<Guest />} />
      <Route path="*" element={<WebLanding />} />
    </Routes>
  );
}

function NativeApp() {
  // Send Universal Links (e.g. a shared /e/:slug guest link) into the router.
  useDeepLinks();
  // Show periodic full-screen ads (free users only) at screen transitions.
  useInterstitialCadence();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Auth />} />
      {/* Public guest link — no auth required. */}
      <Route path="/e/:slug" element={<Guest />} />

      <Route path="/lists" element={<RequireAuth><Lists /></RequireAuth>} />
      <Route path="/create" element={<RequireAuth><Wizard /></RequireAuth>} />
      <Route path="/event/:id" element={<RequireAuth><Owner /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/plus" element={<RequireAuth><Plus /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const location = useLocation();
  // The ad banner lives only on the Lists screen; make sure it's removed everywhere
  // else so it can never overlay a form (e.g. the create-event date field).
  useEffect(() => {
    if (location.pathname !== '/lists') void hideBanner();
  }, [location.pathname]);

  return isWeb ? <WebApp /> : <NativeApp />;
}
