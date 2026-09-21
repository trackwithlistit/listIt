import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass, Bell, List, X, User, SignOut, GearSix,
  House, FilmSlate, Television, SquaresFour, Sun, Moon,
  CaretDown, BookmarkSimple, ShieldCheck,
} from '@phosphor-icons/react';
import { useAuthStore, useUIStore } from '../../store';
import Avatar from '../ui/Avatar';
import Logo from '../ui/Logo';

const NAV_LINKS = [
  { to: '/',        label: 'Home',       icon: House },
  { to: '/anime',   label: 'Anime',      icon: FilmSlate },
  { to: '/series',  label: 'Web Series', icon: Television },
  { to: '/search',  label: 'Search',     icon: MagnifyingGlass },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  const handleNavClick = (e, to) => {
    if (location.pathname === to) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 'var(--navbar-h)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          zIndex: 'var(--z-sticky)',
          background: scrolled
            ? 'rgba(10, 10, 18, 0.88)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        {/* Logo */}
        <Logo size="md" onClick={(e) => handleNavClick(e, '/')} />

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32, flex: 1 }}
          className="nav-links-desktop">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleNavClick(e, to)}
              end={to === '/'}
              style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-overlay)' : 'transparent',
                transition: 'color 0.2s ease, background 0.2s ease',
                textDecoration: 'none',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => navigate('/dashboard?tab=notifications')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-overlay)', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Bell size={18} />
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--warm)', border: '2px solid var(--bg-base)',
                }} />
              </button>

              {/* User Menu */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px 5px 5px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Avatar src={user?.avatar_url} name={user?.username} size={26} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {user?.username}
                  </span>
                  <CaretDown size={12} color="var(--text-muted)" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: 220,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        overflow: 'hidden',
                        zIndex: 'var(--z-dropdown)',
                      }}
                    >
                      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user?.username}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>{user?.email}</p>
                      </div>
                      {[
                        { icon: User, label: 'Profile', to: `/profile/${user?.username}` },
                        { icon: SquaresFour, label: 'Dashboard', to: '/dashboard' },
                        { icon: GearSix, label: 'Settings', to: '/settings' },
                        ...(user?.role === 'admin' ? [{ icon: ShieldCheck, label: 'Admin Panel', to: '/admin' }] : []),
                      ].map(({ icon: Icon, label, to }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 16px',
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)',
                            transition: 'background 0.15s ease, color 0.15s ease',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', width: '100%',
                          color: 'var(--danger)', fontSize: 'var(--text-sm)',
                          borderTop: '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      >
                        <SignOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to="/login"
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)', fontWeight: 500,
                  color: 'var(--text-secondary)', border: '1px solid var(--border)',
                  background: 'var(--bg-overlay)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)', fontWeight: 600,
                  background: 'var(--gradient-brand)', color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-nav-toggle"
            style={{
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(5,5,8,0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 'calc(var(--z-sticky) - 1)',
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
                background: 'var(--bg-elevated)',
                borderLeft: '1px solid var(--border)',
                zIndex: 'var(--z-sticky)',
                display: 'flex', flexDirection: 'column',
                padding: 24,
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Menu</span>
                <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={(e) => { setMobileOpen(false); handleNavClick(e, to); }}
                  end={to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--primary-subtle)' : 'transparent',
                    fontWeight: 500, fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                  })}
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--gradient-brand)', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
