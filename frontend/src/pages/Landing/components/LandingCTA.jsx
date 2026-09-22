import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkle, CheckCircle } from '@phosphor-icons/react';

export default function LandingCTA({
  title = "Ready to Upgrade Your Watchlist Experience?",
  subtitle = "Join thousands of anime and web series fans tracking episodes, discovering seasonal releases, and managing their entertainment.",
  buttonText = "Create Free Account",
  buttonLink = "/register",
  benefits = ["100% Free Forever", "No Annoying Ads", "Fast Multi-Device Sync"]
}) {
  return (
    <section style={{
      padding: '100px 0',
      background: 'var(--bg-deep)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.25) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 75%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '48px 32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary)',
            color: 'var(--primary-light)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            marginBottom: '20px',
          }}>
            <Sparkle size={14} weight="fill" />
            <span>Get Started in 30 Seconds</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}>
            {title}
          </h2>

          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '32px',
            maxWidth: '580px',
            margin: '0 auto 32px auto',
          }}>
            {subtitle}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <Link
              to={buttonLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
                boxShadow: '0 8px 25px var(--primary-glow)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px var(--primary-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px var(--primary-glow)';
              }}
            >
              <span>{buttonText}</span>
              <ArrowRight size={18} weight="bold" />
            </Link>
          </div>

          {/* Benefits List */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            {benefits.map((benefit, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <CheckCircle size={14} color="#10B981" weight="fill" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
