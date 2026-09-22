import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import ComparisonTable from './components/ComparisonTable';
import LandingFAQ from './components/LandingFAQ';
import LandingCTA from './components/LandingCTA';
import { 
  PlayCircle, ListNumbers, Flame, Star, Devices, 
  ShieldCheck, Lightning, SlidersHorizontal, Moon, Users 
} from '@phosphor-icons/react';

export default function FeaturesPage() {
  const allFeatures = [
    {
      icon: PlayCircle,
      title: "1-Click Episode Progress",
      description: "Log your watched episodes in less than a second using the fast '+1 Ep' button across cards, browse lists, and show pages."
    },
    {
      icon: ListNumbers,
      title: "Custom 5-Status Watchlists",
      description: "Organize thousands of titles effortlessly into Watching, Completed, Plan to Watch, On Hold, and Dropped."
    },
    {
      icon: Flame,
      title: "Seasonal Anime Schedules & Charts",
      description: "Browse current and upcoming seasons with real-time airing countdowns, broadcast details, and studio information."
    },
    {
      icon: Star,
      title: "Personal Ratings & Reviews",
      description: "Score shows from 1 to 10, write detailed notes and reviews, and curate your personalized favorites."
    },
    {
      icon: Devices,
      title: "Seamless Cloud Sync Across Devices",
      description: "Your watchlists and episode logs update instantly across desktop, mobile, and tablet browsers."
    },
    {
      icon: Moon,
      title: "Sleek Dark Mode Design",
      description: "Crafted with modern visual hierarchy, fluid animations, and high contrast for maximum eye comfort."
    },
    {
      icon: Lightning,
      title: "Instant Multi-Filter Search",
      description: "Filter instantly by genre, season, release year, rating, format, and status to discover your next binge."
    },
    {
      icon: Users,
      title: "Public Profile & List Sharing",
      description: "Share your curated watchlists, stats, and scores with friends via custom public profile links."
    },
    {
      icon: ShieldCheck,
      title: "Zero Ads & Privacy First",
      description: "No intrusive popups or advertisements. A clean, focused tracking tool built for entertainment fans."
    }
  ];

  const faqs = [
    {
      question: "Are all ListIt features free to use?",
      answer: "Yes, all features on ListIt are 100% free with no paywalled functionality or subscription requirements."
    },
    {
      question: "How does ListIt get anime and series information?",
      answer: "ListIt integrates with leading media databases including AniList and TV data APIs to provide up-to-date titles, descriptions, episode counts, artwork, and release schedules."
    },
    {
      question: "Can I use ListIt on my smartphone?",
      answer: "Yes! ListIt is fully responsive and optimized for mobile browsers, giving you a smooth app-like experience on iOS and Android."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "ListIt Features – All-in-One Anime & Web Series Tracking System",
        "url": "https://trackwithlistit.vercel.app/features",
        "description": "Explore all features of ListIt: 1-click episode progress, custom lists, seasonal anime charts, watch analytics, profile sharing, and dark mode interface."
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
        title="ListIt Features – All-in-One Anime & Web Series Tracking System"
        description="Explore all features of ListIt: 1-click episode progress, custom lists, seasonal anime charts, watch analytics, profile sharing, and dark mode interface."
        keywords="ListIt features, anime tracking features, episode tracker features, anime watchlist features, series tracking tool"
        canonical="https://trackwithlistit.vercel.app/features"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Features', url: '/features' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Powerful Feature Suite"
        title="Everything You Need for"
        highlightText="Effortless Tracking"
        subtitle="Discover the complete set of tools designed to make tracking anime and web series fast, beautiful, and distraction-free."
        primaryCtaText="Get Started Free"
        primaryCtaLink="/register"
        secondaryCtaText="Browse Database"
        secondaryCtaLink="/anime"
        stats={[
          { label: 'Core Features', value: '15+' },
          { label: 'Sync Latency', value: '< 100ms' },
          { label: 'Cost', value: '$0 Always' }
        ]}
      />

      <LandingFeatures
        sectionTitle="Comprehensive Tracking Features"
        sectionSubtitle="Engineered for speed, clarity, and reliability."
        features={allFeatures}
      />

      <ComparisonTable
        title="How ListIt Features Compare"
        subtitle="See why ListIt provides a superior entertainment tracking experience."
      />

      <LandingFAQ
        title="Features FAQ"
        subtitle="Common questions about ListIt's capabilities and updates."
        faqs={faqs}
      />

      <LandingCTA
        title="Experience All Features Today"
        subtitle="Create your free account and start tracking your favorite anime and web series in seconds."
        buttonText="Sign Up Free"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
