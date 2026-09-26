import { Navigate, Route, Routes } from 'react-router-dom';
import type { JSX } from 'react';
import { useAuth } from './store/auth';
import { useUi } from './store/ui';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Lists from './pages/Lists';
import Wizard from './pages/Wizard';
import Owner from './pages/Owner';
import Guest from './pages/Guest';
import Profile from './pages/Profile';
import Plus from './pages/Plus';

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

export default function App() {
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
