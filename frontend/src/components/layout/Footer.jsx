import { Link } from 'react-router-dom';
import { BookmarkSimple, GithubLogo, DiscordLogo, TwitterLogo } from '@phosphor-icons/react';
import Logo from '../ui/Logo';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Anime', to: '/anime' },
    { label: 'Web Series', to: '/series' },
    { label: 'Search', to: '/search' },
    { label: 'Seasonal', to: '/anime/seasonal' },
  ],
  Account: [
    { label: 'Sign Up', to: '/register' },
    { label: 'Log In', to: '/login' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Settings', to: '/settings' },
  ],
  Discover: [
    { label: 'Trending', to: '/anime?sort=trending' },
    { label: 'Top Rated', to: '/anime?sort=top' },
    { label: 'Popular', to: '/anime?sort=popular' },
    { label: 'Upcoming', to: '/anime?status=upcoming' },
  ],
};

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-base)',
      borderTop: '1px solid var(--border)',
      paddingTop: '64px',
      paddingBottom: '32px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(3, auto)',
          gap: '48px',
          marginBottom: '48px',
        }}>
          {/* Brand */}
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <Logo size="md" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 280 }}>
              Your ultimate anime & web series tracking platform. Discover, track, and share your entertainment journey.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[
                { icon: GithubLogo, href: '#', label: 'GitHub' },
                { icon: DiscordLogo, href: '#', label: 'Discord' },
                { icon: TwitterLogo, href: '#', label: 'Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', transition: 'color 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
                marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                {group}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{
                        color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
                        textDecoration: 'none', transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            © {new Date().getFullYear()} listIt. Anime & Web Series data from AniList.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            Built with ❤️ for anime fans
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
