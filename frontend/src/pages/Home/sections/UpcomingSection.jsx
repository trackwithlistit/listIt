import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, Clock } from '@phosphor-icons/react';
import anilistAPI from '../../../services/anilist';

function Countdown({ seconds }) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
      {d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`}
    </span>
  );
}

export default function UpcomingSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const weekLater = now + 7 * 86400;
    anilistAPI.getAiringSchedule({ from: now, to: weekLater })
      .then((d) => setItems(d.Page?.airingSchedules?.slice(0, 10) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="section-gap">
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />
            Upcoming Episodes
          </h2>
          <p className="section-subtitle">Airing this week</p>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {(loading ? Array.from({ length: 6 }) : items).map((item, i) => (
          loading ? (
            <div key={i} style={{
              height: 72, borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }} className="skeleton" />
          ) : (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/anime/${item.media?.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                >
                  <img
                    src={item.media?.coverImage?.large}
                    alt={item.media?.title?.romaji}
                    style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3,
                    }}>
                      {item.media?.title?.english || item.media?.title?.romaji}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Episode {item.episode}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Timer size={12} color="var(--accent)" />
                      <Countdown seconds={item.airingAt - Math.floor(Date.now() / 1000)} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        ))}
      </div>
    </section>
  );
}
