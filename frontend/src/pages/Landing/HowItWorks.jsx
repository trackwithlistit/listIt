import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import ComparisonTable from './components/ComparisonTable';
import LandingFAQ from './components/LandingFAQ';
import LandingCTA from './components/LandingCTA';
import { MagnifyingGlass, PlusCircle, PlayCircle, Star, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      icon: PlusCircle,
      title: "Create Your Free Account",
      description: "Sign up in 10 seconds with your email and username. No credit card, no complex onboarding."
    },
    {
      step: "02",
      icon: MagnifyingGlass,
      title: "Search & Add Your Shows",
      description: "Search across 10,000+ anime series and web series. Add titles directly to your Watching or Plan to Watch lists."
    },
    {
      step: "03",
      icon: PlayCircle,
      title: "Log Episodes with 1 Click",
      description: "As you watch episodes, tap '+1 Ep' to increment your counter. When you finish, mark the show as Completed and leave your rating."
    }
  ];

  const faqs = [
    {
      question: "How long does it take to set up my watchlist?",
      answer: "Setting up your account takes less than a minute. You can immediately search and add your favorite anime and web series to your list."
    },
    {
      question: "Can I import or export my data?",
      answer: "ListIt is built to easily catalog all your titles with real-time syncing across all browsers and devices."
    },
    {
      question: "Does ListIt notify me when new episodes air?",
      answer: "Yes, you can check seasonal airing schedules and upcoming release dates directly from the seasonal anime and browse sections."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "name": "How to Track Anime and Web Series with ListIt",
        "description": "A step-by-step guide to tracking anime and web series episodes, managing watchlists, and discovering new shows on ListIt.",
        "step": steps.map((s, idx) => ({
          "@type": "HowToStep",
          "position": idx + 1,
          "name": s.title,
          "text": s.description
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      }
    ]
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO
        title="How It Works – 3 Steps to Tracking Your Anime & Series | ListIt"
        description="Learn how to search, add, track episodes, and organize your favorite anime and web series in seconds on ListIt."
        keywords="how to track anime, how ListIt works, anime tracker tutorial, how to track episodes, web series tracking guide"
        canonical="https://trackwithlistit.vercel.app/how-it-works"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'How It Works', url: '/how-it-works' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Simple 3-Step Process"
        title="How ListIt Makes Tracking"
        highlightText="Effortless & Fun"
        subtitle="Learn how you can start tracking your entire anime and web series journey in just 3 quick steps."
        primaryCtaText="Start in 30 Seconds"
        primaryCtaLink="/register"
        secondaryCtaText="Browse Catalog"
        secondaryCtaLink="/anime"
        stats={[
          { label: 'Setup Time', value: '< 1 Min' },
          { label: 'Log Speed', value: 'Instant' },
          { label: 'Cost', value: '100% Free' }
        ]}
      />

      {/* Step by Step Section */}
      <section style={{ padding: '80px 0', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Three Simple Steps to Master Your Watchlist
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Get organized in seconds with our streamlined workflow.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}>
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '36px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '24px',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--border)',
                    opacity: 0.6,
                    lineHeight: 1,
                  }}>
                    {item.step}
                  </div>

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
                    marginBottom: '24px',
                  }}>
                    <Icon size={24} weight="duotone" />
                  </div>

                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ComparisonTable
        title="Experience the Difference"
        subtitle="See how ListIt simplifies tracking compared to messy manual lists."
      />

      <LandingFAQ
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about getting started."
        faqs={faqs}
      />

      <LandingCTA
        title="Ready to Get Started?"
        subtitle="Sign up for free and organize your entire anime and web series collection today."
        buttonText="Create Free Account"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
