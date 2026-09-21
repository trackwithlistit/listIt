import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import AnimeCard from './AnimeCard';

export default function AnimeCarousel({ icon: Icon, title, subtitle, viewAllTo, anime = [], cardSize = 'md', loading = false }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <section className="section-gap">
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icon && <Icon size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />}
            {title}
          </h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {viewAllTo && (
            <Link
              to={viewAllTo}
              style={{
                fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--primary-light)',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              View All
            </Link>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            {[CaretLeft, CaretRight].map((Icon, i) => (
              <button
                key={i}
                onClick={() => scroll(i === 0 ? -1 : 1)}
                style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: 'flex', gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: 8,
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: cardSize === 'sm' ? 140 : cardSize === 'lg' ? 220 : 180,
                flexShrink: 0,
                scrollSnapAlign: 'start',
              }}>
                <div className="skeleton" style={{ height: cardSize === 'sm' ? 196 : cardSize === 'lg' ? 310 : 256, borderRadius: 'var(--radius-lg)' }} />
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  <div className="skeleton" style={{ height: 12, width: '50%' }} />
                </div>
              </div>
            ))
          : anime.map((a) => (
              <div key={a.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <AnimeCard anime={a} size={cardSize} />
              </div>
            ))
        }
      </div>
    </section>
  );
}
