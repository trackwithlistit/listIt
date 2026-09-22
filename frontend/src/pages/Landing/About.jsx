import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import LandingCTA from './components/LandingCTA';
import { Sparkle, Heart, Code, ShieldCheck, Rocket, FilmSlate } from '@phosphor-icons/react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Built by Fans, for Fans",
      description: "We are passionate anime viewers and series binge-watchers who wanted a faster, cleaner tool without intrusive ads or clunky legacy design."
    },
    {
      icon: Code,
      title: "Performance & Reliability First",
      description: "Built using modern web technologies to ensure sub-100ms response times, smooth micro-animations, and 99.9% uptime."
    },
    {
      icon: ShieldCheck,
      title: "Privacy & User Respect",
      description: "Your data belongs to you. We don't sell your personal data or clutter your screen with popups and banners."
    },
    {
      icon: Rocket,
      title: "Continuous Evolution",
      description: "We constantly add community-requested features, improved discovery algorithms, and better seasonal schedule trackers."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "name": "About ListIt – Built for Anime & Web Series Enthusiasts",
        "url": "https://trackwithlistit.vercel.app/about",
        "description": "Learn about ListIt's mission to create the cleanest, fastest, and most intuitive entertainment tracking platform for anime and web series fans worldwide."
      },
      {
        "@type": "Organization",
        "name": "ListIt",
        "url": "https://trackwithlistit.vercel.app/",
        "logo": "https://trackwithlistit.vercel.app/favicon.svg",
        "sameAs": [
          "https://twitter.com/trackwithlistit",
          "https://github.com/trackwithlistit"
        ]
      }
    ]
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO
        title="About ListIt – Built for Anime & Web Series Enthusiasts"
        description="Learn about ListIt's mission to create the cleanest, fastest, and most intuitive entertainment tracking platform for anime and web series fans worldwide."
        keywords="About ListIt, ListIt anime, Track with ListIt, ListIt tracker, anime tracking platform"
        canonical="https://trackwithlistit.vercel.app/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Our Story & Mission"
        title="The Ultimate Entertainment"
        highlightText="Tracking Platform"
        subtitle="ListIt was born out of frustration with outdated, ad-heavy trackers. We set out to build the fastest, cleanest, and most delightful tracking experience for anime and web series fans."
        primaryCtaText="Join ListIt Free"
        primaryCtaLink="/register"
        secondaryCtaText="Explore Shows"
        secondaryCtaLink="/anime"
        stats={[
          { label: 'Founded', value: '2026' },
          { label: 'Ads Allowed', value: '0%' },
          { label: 'User Focus', value: '100%' }
        ]}
      />

      <LandingFeatures
        sectionTitle="Our Core Principles"
        sectionSubtitle="What drives the design and continuous development of ListIt."
        features={values}
      />

      <LandingCTA
        title="Be Part of the ListIt Journey"
        subtitle="Create your free account today and start tracking what you love."
        buttonText="Get Started Free"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
