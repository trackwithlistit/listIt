import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, PlayCircle, BookmarkSimple, Heart } from '@phosphor-icons/react';
import Badge from '../ui/Badge';
import SafeImage from '../ui/SafeImage';

function scoreColor(score) {
  if (!score) return 'var(--text-muted)';
  if (score >= 75) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function formatStatus(status) {
  const map = { RELEASING: 'airing', FINISHED: 'finished', NOT_YET_RELEASED: 'upcoming', CANCELLED: 'cancelled' };
  return map[status] || status?.toLowerCase();
}

export default function AnimeCard({ anime, size = 'md', showScore = true, showGenres = true }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!anime) return null;
  const title = anime.title?.english || anime.title?.romaji || 'Unknown';
  const cover  = anime.coverImage?.large || anime.coverImage?.medium || '';
  const score  = anime.averageScore;
  const genres = anime.genres?.slice(0, 3) || [];

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
      <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {/* Image Container */}
        <div style={{
          width: '100%', height: imgHeight,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          background: anime.coverImage?.color || 'var(--bg-elevated)',
          boxShadow: hovered
            ? `0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px var(--border-hover)`
            : 'var(--shadow-md)',
          transition: 'box-shadow 0.25s ease',
        }}>
          {!imgError && cover ? (
            <SafeImage
              src={cover}
              alt={title}
              isAdult={anime.isAdult || anime.genres?.includes('Hentai')}
              hovered={hovered}
              onError={() => setImgError(true)}
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
            <PlayCircle size={36} weight="fill" color="var(--primary-light)" />
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
                {(score / 10).toFixed(1)}
              </span>
            </div>
          )}

          {/* Status badge */}
          {anime.status && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Badge status={formatStatus(anime.status)} size="xs" />
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
            {anime.format && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {anime.format}
              </span>
            )}
            {anime.episodes && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {anime.episodes} eps</span>
            )}
          </div>
          {showGenres && genres.length > 0 && (
            <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
              {genres.map((g) => (
                <span key={g} style={{
                  fontSize: 10, fontWeight: 500,
                  background: 'var(--primary-subtle)', color: 'var(--primary-light)',
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
