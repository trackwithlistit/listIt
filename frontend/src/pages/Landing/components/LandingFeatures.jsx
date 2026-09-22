import { motion } from 'framer-motion';
import { 
  CheckCircle, PlayCircle, Star, Sparkle, 
  Clock, ShieldCheck, Flame, ListNumbers, Devices, Bell 
} from '@phosphor-icons/react';

export default function LandingFeatures({
  sectionTitle = "Everything You Need to Track Anime & Series",
  sectionSubtitle = "Built specifically for modern viewers who want an effortless, beautiful, and distraction-free tracking experience.",
  features = [
    {
      icon: PlayCircle,
      title: "1-Click Episode Tracking",
      description: "Increment your watched episode count in a single tap from your dashboard, browse cards, or detail pages without tedious forms."
    },
    {
      icon: ListNumbers,
      title: "Smart Watchlists",
      description: "Organize thousands of titles seamlessly into Watching, Completed, Plan to Watch, On Hold, and Dropped with custom private notes."
    },
    {
      icon: Flame,
      title: "Seasonal Airing Schedules",
      description: "Never miss a premiere. Explore current and upcoming anime seasons with countdowns, studio details, and broadcast schedules."
    },
    {
      icon: Star,
      title: "Detailed Ratings & Reviews",
      description: "Score your favorite shows on a 10-point scale, log review thoughts, and analyze your personal viewing stats."
    },
    {
      icon: Devices,
      title: "Multi-Platform Sync",
      description: "Track across mobile, tablet, and desktop with instant cloud synchronization. Your progress is always up to date."
    },
    {
      icon: ShieldCheck,
      title: "Privacy First & Ad-Free",
      description: "Zero intrusive ads, clean performance, and complete control over your public or private watchlist settings."
    }
  ]
}) {
  return (
    <section style={{
      padding: '80px 0',
      background: 'var(--bg-elevated)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            {sectionTitle}
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            {sectionSubtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon || CheckCircle;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 12px 30px var(--primary-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Icon Box */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-light)',
                }}>
                  <Icon size={24} weight="duotone" />
                </div>

                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
