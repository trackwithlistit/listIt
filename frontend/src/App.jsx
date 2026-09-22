import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import Navbar from './components/layout/Navbar';
import PageTransition from './components/animations/PageTransition';

// Pages
import HomePage        from './pages/Home';
import AnimeBrowse     from './pages/Anime/Browse';
import AnimeDetail     from './pages/Anime/Detail';
import SeasonalPage    from './pages/Anime/Seasonal';
import SeriesBrowse    from './pages/Series/Browse';
import SeriesDetail    from './pages/Series/Detail';
import SearchPage      from './pages/Search';
import LoginPage       from './pages/Auth/Login';
import RegisterPage    from './pages/Auth/Register';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';
import ProfilePage     from './pages/Profile';
import DashboardPage   from './pages/Dashboard';
import ListsPage       from './pages/Lists';
import SettingsPage    from './pages/Settings';
import AdminPage       from './pages/Admin';
import NotFoundPage    from './pages/Errors/NotFound';

// SEO Landing Pages
import AnimeTrackerPage    from './pages/Landing/AnimeTracker';
import AnimeWatchlistPage  from './pages/Landing/AnimeWatchlist';
import WebSeriesTrackerPage from './pages/Landing/WebSeriesTracker';
import TVSeriesTrackerPage  from './pages/Landing/TVSeriesTracker';
import FeaturesPage        from './pages/Landing/Features';
import HowItWorksPage      from './pages/Landing/HowItWorks';
import AboutPage           from './pages/Landing/About';

import { useAuthStore, useUIStore } from './store';

// ── Protected Route ──
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── Layout wrapper (adds Navbar) ──
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <PageTransition>
        {children}
      </PageTransition>
    </>
  );
}

export default function App() {
  const { fetchMe, isAuthenticated } = useAuthStore();
  const { theme } = useUIStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Refresh user on mount
  useEffect(() => {
    const token = localStorage.getItem('listit_token');
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background:   'var(--bg-elevated)',
            color:        'var(--text-primary)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize:     '14px',
            fontFamily:   'var(--font-body)',
            boxShadow:    'var(--shadow-lg)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public routes with Navbar */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/anime" element={<Layout><AnimeBrowse /></Layout>} />
        <Route path="/anime/seasonal" element={<Layout><SeasonalPage /></Layout>} />
        <Route path="/anime/:id" element={<Layout><AnimeDetail /></Layout>} />
        <Route path="/series" element={<Layout><SeriesBrowse /></Layout>} />
        <Route path="/series/:id" element={<Layout><SeriesDetail /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/profile/:username" element={<Layout><ProfilePage /></Layout>} />

        {/* SEO Landing Pages */}
        <Route path="/anime-tracker"       element={<Layout><AnimeTrackerPage /></Layout>} />
        <Route path="/anime-watchlist"     element={<Layout><AnimeWatchlistPage /></Layout>} />
        <Route path="/web-series-tracker"  element={<Layout><WebSeriesTrackerPage /></Layout>} />
        <Route path="/tv-series-tracker"   element={<Layout><TVSeriesTrackerPage /></Layout>} />
        <Route path="/features"            element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/how-it-works"        element={<Layout><HowItWorksPage /></Layout>} />
        <Route path="/about"               element={<Layout><AboutPage /></Layout>} />

        {/* Auth routes (no Navbar overlay needed) */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/lists"     element={<ProtectedRoute><Layout><ListsPage /></Layout></ProtectedRoute>} />
        <Route path="/settings"  element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
