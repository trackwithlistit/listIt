import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';

export default function SeasonalGrid({ anime = [], loading = false }) {
  const items = loading ? Array.from({ length: 12 }) : anime.slice(0, 12);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 16,
    }}>
      {items.map((a, i) => (
        loading ? (
          <div key={i} style={{
            height: 100, borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            overflow: 'hidden', display: 'flex',
          }}>
            <div className="skeleton" style={{ width: 70, flexShrink: 0, borderRadius: 0 }} />
            <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
              <div className="skeleton" style={{ height: 12, width: '50%' }} />
              <div className="skeleton" style={{ height: 10, width: '60%' }} />
            </div>
          </div>
        ) : (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Link to={`/anime/${a.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                height: 100,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                display: 'flex',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <img
                  src={a.coverImage?.medium || a.coverImage?.large}
                  alt={a.title?.romaji}
                  loading="lazy"
                  style={{ width: 70, flexShrink: 0, objectFit: 'cover' }}
                />
                <div style={{ padding: '10px 14px', flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: 'var(--text-primary)', marginBottom: 4,
                  }}>
                    {a.title?.english || a.title?.romaji}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    {a.averageScore && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                        <Star size={10} weight="fill" />
                        {(a.averageScore / 10).toFixed(1)}
                      </span>
                    )}
                    {a.episodes && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {a.episodes} eps</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {a.genres?.slice(0, 3).map((g) => (
                      <span key={g} style={{
                        fontSize: 10, fontWeight: 500,
                        background: 'var(--primary-subtle)', color: 'var(--primary-light)',
                        padding: '1px 6px', borderRadius: 3,
                      }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      ))}
    </div>
  );
}
