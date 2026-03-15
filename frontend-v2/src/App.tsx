import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/MainLayout';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPanel } from './pages/AdminPanel';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'ADMIN';

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/events" element={isAdmin ? <AdminPanel /> : <EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <AppRoutes />
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
