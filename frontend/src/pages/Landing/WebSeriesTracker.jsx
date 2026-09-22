import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import ComparisonTable from './components/ComparisonTable';
import LandingFAQ from './components/LandingFAQ';
import LandingCTA from './components/LandingCTA';
import { Television, PlayCircle, Clock, Sparkle, FilmSlate, Devices } from '@phosphor-icons/react';

export default function WebSeriesTrackerPage() {
  const faqs = [
    {
      question: "What is a Web Series Tracker?",
      answer: "A web series tracker is an application designed to help you follow online web series, streaming originals, and multi-season TV shows. It tracks your episode progress, season numbers, and keeps your viewing history organized across platforms."
    },
    {
      question: "Can I track web series from Netflix, HBO, Disney+, and Prime Video?",
      answer: "Yes! ListIt lets you search and track web series, streaming originals, and television shows from all major streaming networks and web platforms."
    },
    {
      question: "How does episode progress tracking work for multi-season series?",
      answer: "ListIt displays total episode counts and allows you to increment your progress with 1 click (+1 Ep) or specify your current episode number directly."
    },
    {
      question: "Can I track both anime and web series in the same account?",
      answer: "Yes! ListIt is uniquely built to track both Anime and Web Series under a single, unified account with dedicated sections and combined statistics."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "ListIt Web Series Tracker",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Track web series, streaming originals, seasons and episodes in one sleek tracker.",
        "url": "https://trackwithlistit.vercel.app/web-series-tracker"
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

  const features = [
    {
      icon: Television,
      title: "Streaming Series Tracking",
      description: "Follow popular web series and originals from all leading streaming networks in one unified hub."
    },
    {
      icon: PlayCircle,
      title: "Season & Episode Counter",
      description: "Never forget which season or episode you were watching. Increment in 1 tap on any device."
    },
    {
      icon: FilmSlate,
      title: "Unified Anime & Series Library",
      description: "No need for multiple apps. Track Japanese anime alongside Western web series in one place."
    },
    {
      icon: Clock,
      title: "Watch History Timeline",
      description: "Maintain a comprehensive history of everything you've watched, completed, and rated over time."
    },
    {
      icon: Sparkle,
      title: "Discover Trending Series",
      description: "Explore top-rated and trending web series with synopsis, genres, and community ratings."
    },
    {
      icon: Devices,
      title: "Cloud Sync Everywhere",
      description: "Switch seamlessly between your desktop, phone, or tablet with automatic real-time sync."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO
        title="Web Series Tracker – Track Seasons & Episodes Across Platforms | ListIt"
        description="Track web series and streaming shows with ListIt. Log episodes, follow seasons, discover trending web series, and keep your watch history organized online for free."
        keywords="web series tracker, web series tracking, track web series, series tracker, TV show tracker, episode tracker for web series, streaming series watchlist"
        canonical="https://trackwithlistit.vercel.app/web-series-tracker"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Web Series Tracker', url: '/web-series-tracker' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Ultimate Web Series Tracker"
        title="Never Lose Your Spot in a"
        highlightText="Web Series Again"
        subtitle="Track seasons, episodes, and release progress for all your favorite web series and streaming shows. Clean, fast, and completely free."
        primaryCtaText="Start Tracking Series"
        primaryCtaLink="/register"
        secondaryCtaText="Browse Web Series"
        secondaryCtaLink="/series"
        stats={[
          { label: 'Web Series Tracked', value: 'Thousands' },
          { label: 'Episode Log Speed', value: '1-Click' },
          { label: 'All Platforms', value: 'Supported' }
        ]}
      />

      <LandingFeatures
        sectionTitle="The Best Way to Track Web Series"
        sectionSubtitle="Designed for binge-watchers who want simplicity, speed, and beautiful artwork."
        features={features}
      />

      <ComparisonTable
        title="ListIt Series Tracker vs Generic Note Taking Apps"
        subtitle="Get automatic show synopses, episode counts, artwork, and rating stats instead of messy text lists."
      />

      <LandingFAQ
        title="Web Series Tracking FAQ"
        subtitle="Common questions about tracking streaming shows and web series on ListIt."
        faqs={faqs}
      />

      <LandingCTA
        title="Track All Your Web Series with ListIt"
        subtitle="Join for free today and take control of your streaming watchlists and episode progress."
        buttonText="Create Free Account"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
