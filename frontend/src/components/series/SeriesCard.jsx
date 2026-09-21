import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, PlayCircle } from '@phosphor-icons/react';
import Badge from '../ui/Badge';

function scoreColor(score) {
  if (!score) return 'var(--text-muted)';
  if (score >= 7.5) return '#10B981';
  if (score >= 6.0) return '#F59E0B';
  return '#EF4444';
}

function formatStatus(status) {
  const map = { 'Running': 'airing', 'Ended': 'finished', 'In Development': 'upcoming', 'To Be Determined': 'upcoming' };
  return map[status] || status?.toLowerCase();
}

export default function SeriesCard({ series, size = 'md', view = 'grid', showScore = true, showGenres = true }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!series) return null;
  // Handle both direct show object (from /shows) and search wrapper { show: ... }
  const show = series.show || series;
  
  const title = show.name || 'Unknown';
  const cover  = show.image?.original || show.image?.medium || '';
  const score  = show.rating?.average;
  const genres = show.genres?.slice(0, 2) || [];
  
  // Extract platform/network
  const platform = show.webChannel?.name || show.network?.name;

  if (view === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%', cursor: 'pointer' }}
      >
        <Link to={`/series/${show.id}`} style={{
          textDecoration: 'none', color: 'inherit', display: 'flex', gap: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 12, alignItems: 'center',
        }}>
          {/* Cover image */}
          <div style={{ width: 60, height: 84, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)' }}>
            {!imgError && cover ? (
              <img src={cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)' }}>No Image</div>
            )}
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </h3>
              {show.status && <Badge status={formatStatus(show.status)} size="xs" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              {platform && <span>{platform}</span>}
              {show.premiered && <span>· {show.premiered.substring(0, 4)}</span>}
            </div>
            {show.summary && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                {show.summary.replace(/<[^>]*>/g, '')}
              </p>
            )}
          </div>

          {/* Score & Genres */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            {score && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(5,5,8,0.7)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <Star size={12} weight="fill" color="#F59E0B" />
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score), fontFamily: 'var(--font-mono)' }}>{score.toFixed(1)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 4 }}>
              {genres.slice(0, 2).map((g) => (
                <span key={g} style={{ fontSize: 10, background: 'rgba(6,182,212,0.15)', color: '#22D3EE', padding: '2px 6px', borderRadius: 4 }}>{g}</span>
              ))}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  const sizeMap = {
    sm: { width: 140, imgHeight: 196 },
    md: { width: 180, imgHeight: 256 },
    lg: { width: 220, imgHeight: 310 },
  };
  const { width, imgHeight } = sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ width, flexShrink: 0, cursor: 'pointer' }}
    >
      <Link to={`/series/${show.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {/* Image Container */}
        <div style={{
          width: '100%', height: imgHeight,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--bg-elevated)',
          boxShadow: hovered
            ? `0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px var(--border-hover)`
            : 'var(--shadow-md)',
          transition: 'box-shadow 0.25s ease',
        }}>
          {!imgError && cover ? (
            <img
              src={cover}
              alt={title}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)',
              color: 'var(--text-muted)', fontSize: 12,
            }}>
              No Image
            </div>
          )}

          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(5,5,8,0.9) 0%, rgba(5,5,8,0.3) 50%, transparent 100%)',
              display: 'flex', alignItems: 'flex-end', padding: '12px',
            }}
          >
            <PlayCircle size={36} weight="fill" color="#06B6D4" />
          </motion.div>

          {/* Score badge */}
          {showScore && score && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(5,5,8,0.85)',
              backdropFilter: 'blur(8px)',
              padding: '3px 7px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}>
              <Star size={11} weight="fill" color="#F59E0B" />
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(score), fontFamily: 'var(--font-mono)' }}>
                {score.toFixed(1)}
              </span>
            </div>
          )}

          {/* Status badge */}
          {show.status && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Badge status={formatStatus(show.status)} size="xs" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ marginTop: 10, padding: '0 2px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: 4,
          }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {platform && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {platform}
              </span>
            )}
            {show.premiered && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {show.premiered.substring(0,4)}</span>
            )}
          </div>
          {showGenres && genres.length > 0 && (
            <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
              {genres.map((g) => (
                <span key={g} style={{
                  fontSize: 10, fontWeight: 500,
                  background: 'rgba(6,182,212,0.15)', color: '#22D3EE',
                  padding: '2px 7px', borderRadius: 4,
                }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
