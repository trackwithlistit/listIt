import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from '@phosphor-icons/react';

export default function CharacterRow({ characters = [], loading = false }) {
  const items = loading ? Array.from({ length: 12 }) : characters;

  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
      {items.map((c, i) => (
        loading ? (
          <div key={i} style={{ flexShrink: 0, width: 120, textAlign: 'center' }}>
            <div className="skeleton" style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 10px' }} />
            <div className="skeleton" style={{ height: 13, width: '80%', margin: '0 auto 6px' }} />
            <div className="skeleton" style={{ height: 11, width: '50%', margin: '0 auto' }} />
          </div>
        ) : (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            style={{ flexShrink: 0, width: 120, textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid var(--border)',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
              >
                <img
                  src={c.image?.large}
                  alt={c.name?.full}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {c.favourites && (
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)', padding: '2px 6px',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <Heart size={10} weight="fill" color="var(--warm)" />
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {c.favourites > 1000 ? `${(c.favourites / 1000).toFixed(1)}k` : c.favourites}
                  </span>
                </div>
              )}
            </div>
            <p style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {c.name?.full}
            </p>
            <p style={{
              fontSize: 11, color: 'var(--text-muted)', marginTop: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {c.media?.nodes?.[0]?.title?.romaji}
            </p>
          </motion.div>
        )
      ))}
    </div>
  );
}
