import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Star, BookmarkSimple, ArrowRight } from '@phosphor-icons/react';
import ParticleBackground from '../../../components/animations/ParticleBackground';
import Button from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import Badge from '../../../components/ui/Badge';

export default function FeaturedHero({ anime, loading }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // If we have multiple featured, rotate (for now single item)
  const title = anime?.title?.english || anime?.title?.romaji || 'listIt';
  const banner = anime?.bannerImage || anime?.coverImage?.extraLarge || '';
  const desc = anime?.description
    ? anime.description.replace(/<[^>]*>/g, '').slice(0, 200) + '...'
    : '';
  const score = anime?.averageScore;
  const genres = anime?.genres?.slice(0, 3) || [];

  return (
    <section style={{
      position: 'relative',
      height: 'clamp(520px, 80vh, 800px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      marginBottom: 0,
      marginTop: 'var(--navbar-h)',
    }}>
      {/* BG image with blur */}
      <AnimatePresence>
        {banner && !loading && (
          <motion.div
            key={banner}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              filter: 'blur(2px) brightness(0.35)',
              transform: 'scale(1.05)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(5,5,8,0.95) 35%, rgba(5,5,8,0.4) 70%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--bg-deep) 0%, transparent 40%)',
      }} />

      {/* Particles */}
      <ParticleBackground />

      {/* Gradient blobs */}
      <div style={{
        position: 'absolute', top: '20%', left: '5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'var(--primary-glow)', filter: 'blur(80px)', opacity: 0.4,
        pointerEvents: 'none', animation: 'blobDrift 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'var(--accent-glow)', filter: 'blur(100px)', opacity: 0.25,
        pointerEvents: 'none', animation: 'blobDrift 18s ease-in-out infinite reverse',
      }} />

      {/* Content */}
      <div className="container" style={{
        position: 'relative', zIndex: 2,
        height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        paddingTop: 'calc(64px + 32px)',
        paddingBottom: 'clamp(40px, 6vh, 80px)',
        boxSizing: 'border-box',
      }}>
        {loading ? (
          <div style={{ maxWidth: 560 }}>
            <Skeleton height={16} width={120} style={{ marginBottom: 16 }} />
            <Skeleton height={56} width="90%" style={{ marginBottom: 12 }} />
            <Skeleton height={56} width="70%" style={{ marginBottom: 20 }} />
            <Skeleton height={20} width="100%" style={{ marginBottom: 8 }} />
            <Skeleton height={20} width="80%" style={{ marginBottom: 32 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <Skeleton height={48} width={160} borderRadius="var(--radius-md)" />
              <Skeleton height={48} width={140} borderRadius="var(--radius-md)" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: 600 }}
          >
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--primary-light)',
                background: 'var(--primary-subtle)',
                padding: '4px 12px', borderRadius: 4,
                border: '1px solid rgba(124,58,237,0.25)',
              }}>
                Featured
              </span>
              {genres.map((g) => (
                <span key={g} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{g}</span>
              ))}
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: 16,
              color: 'var(--text-primary)',
            }}>
              {title}
            </h1>

            {/* Score + info row */}
            {score && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={18} weight="fill" color="#F59E0B" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-xl)', color: '#F59E0B' }}>
                    {(score / 10).toFixed(1)}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  {anime?.format} · {anime?.episodes || '?'} eps · {anime?.season} {anime?.seasonYear}
                </span>
              </div>
            )}

            {/* Description */}
            {desc && (
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-base)',
                lineHeight: 1.75,
                marginBottom: 32,
                maxWidth: 520,
              }}>
                {desc}
              </p>
            )}

            {/* CTA buttons */}
            {anime && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button
                  size="lg"
                  icon={<PlayCircle size={20} weight="fill" />}
                  onClick={() => {}}
                  style={{
                    background: 'var(--gradient-brand)',
                    boxShadow: 'var(--shadow-glow-purple)',
                  }}
                >
                  <Link to={`/anime/${anime.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    View Details
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  icon={<BookmarkSimple size={18} />}
                  style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.08)' }}
                >
                  Add to List
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
