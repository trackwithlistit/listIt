import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FilmSlate, CheckCircle, Sparkle, ShieldCheck, Users } from '@phosphor-icons/react';
import InteractiveTrackerPreview from './InteractiveTrackerPreview';

export default function LandingHero({
  badge = 'The #1 Anime & Web Series Tracking Platform',
  title,
  highlightText,
  subtitle,
  primaryCtaText = 'Start Tracking Free',
  primaryCtaLink = '/register',
  secondaryCtaText = 'Browse Database',
  secondaryCtaLink = '/anime',
  stats = [
    { label: 'Anime & Series Tracked', value: '10,000+' },
    { label: 'Episode Sync Speed', value: '< 100ms' },
    { label: 'Community Rating', value: '4.9/5' },
  ]
}) {
  return (
    <section style={{
      position: 'relative',
      paddingTop: 'calc(var(--navbar-h) + 40px)',
      paddingBottom: '80px',
      overflow: 'hidden',
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, rgba(6, 182, 212, 0.1) 60%, transparent 80%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '48px',
          alignItems: 'center',
        }}>
          {/* Left Column: Copy & Actions */}
          <div>
            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-subtle)',
                border: '1px solid var(--primary)',
                color: 'var(--primary-light)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '20px',
              }}
            >
              <Sparkle size={14} weight="fill" />
              <span>{badge}</span>
            </motion.div>

            {/* Main H1 Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                marginBottom: '20px',
              }}
            >
              {title}{' '}
              {highlightText && (
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {highlightText}
                </span>
              )}
            </motion.h1>

            {/* Subtitle / Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '32px',
                maxWidth: '560px',
              }}
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '40px',
              }}
            >
              <Link
                to={primaryCtaLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 'var(--text-base)',
                  boxShadow: '0 8px 24px var(--primary-glow)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px var(--primary-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px var(--primary-glow)';
                }}
              >
                <span>{primaryCtaText}</span>
                <ArrowRight size={18} weight="bold" />
              </Link>

              <Link
                to={secondaryCtaLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                  border: '1px solid var(--border)',
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <span>{secondaryCtaText}</span>
              </Link>
            </motion.div>

            {/* Key Value Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border)',
            }}>
              {stats.map((item, idx) => (
                <div key={idx}>
                  <div style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {item.value}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InteractiveTrackerPreview />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          section .container > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
