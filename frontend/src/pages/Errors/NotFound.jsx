import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkSimple, ArrowLeft, Warning } from '@phosphor-icons/react';
import Button from '../../components/ui/Button';
import ParticleBackground from '../../components/animations/ParticleBackground';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center', padding: '20px',
    }}>
      <ParticleBackground />
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'var(--primary-glow)', filter: 'blur(80px)', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(80px)', opacity: 0.3 }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-flex', marginBottom: 24, color: 'var(--primary-light)' }}
        >
          <Warning size={80} />
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 15vw, 10rem)',
          fontWeight: 800,
          letterSpacing: '-0.06em',
          background: 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: 16,
        }}>
          404
        </h1>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
          This page must be on a filler arc. The anime you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <Button size="lg" icon={<ArrowLeft size={18} />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/anime">
            <Button variant="ghost" size="lg">
              Browse Anime
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
