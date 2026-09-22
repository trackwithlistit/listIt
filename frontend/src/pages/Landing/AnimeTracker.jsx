import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import ComparisonTable from './components/ComparisonTable';
import LandingFAQ from './components/LandingFAQ';
import LandingCTA from './components/LandingCTA';
import { PlayCircle, ListNumbers, Flame, Star, Devices, ShieldCheck, Sparkle, Lightning } from '@phosphor-icons/react';

export default function AnimeTrackerPage() {
  const faqs = [
    {
      question: "What is an Anime Tracker?",
      answer: "An anime tracker is a specialized tool that helps you log and manage every anime show or movie you watch. It automatically keeps count of episodes, remembers where you stopped, organizes series into categories (Watching, Completed, Plan to Watch, Dropped), and alerts you when new episodes air."
    },
    {
      question: "Is ListIt completely free to use?",
      answer: "Yes! ListIt is 100% free with no hidden paywalls, no limits on the number of anime you can add, and no annoying advertisements."
    },
    {
      question: "How do I increment or update anime episode progress?",
      answer: "With ListIt, you can update your episode count in one click using the '+1 Ep' button found directly on your dashboard, watchlist, or any anime page. You can also manually type the episode number or mark the entire show as Completed."
    },
    {
      question: "Does ListIt have anime airing schedules and seasonal charts?",
      answer: "Yes. ListIt tracks seasonal anime for Spring, Summer, Fall, and Winter with live airing countdowns, premiere dates, and studio info powered by comprehensive AniList metadata."
    },
    {
      question: "Can I track both anime and web series on ListIt?",
      answer: "Yes! Unlike traditional anime-only trackers, ListIt allows you to track Japanese Anime and Western TV/Web Series in one unified, sleek dashboard."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "ListIt Anime Tracker",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "The fastest, cleanest anime tracker and episode progress manager. Track seasonal anime, maintain your watchlist, and sync progress across devices.",
        "url": "https://trackwithlistit.vercel.app/anime-tracker"
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
      icon: PlayCircle,
      title: "1-Click Episode Incrementing",
      description: "Increment your anime episode count in less than a second. No slow loading times, no friction."
    },
    {
      icon: Flame,
      title: "Seasonal Anime Schedules",
      description: "Browse Winter, Spring, Summer, and Fall anime with real-time airing countdowns and studio information."
    },
    {
      icon: ListNumbers,
      title: "Granular Watchlist Categories",
      description: "Organize anime into Watching, Completed, Plan to Watch, On Hold, and Dropped with personalized scores and tags."
    },
    {
      icon: Star,
      title: "Detailed Anime Ratings & Reviews",
      description: "Rate shows on a 10-point scale, log episode reactions, and keep your thoughts organized."
    },
    {
      icon: Lightning,
      title: "Lightning Fast Search",
      description: "Instant search across thousands of titles with genre, season, format, and status filters."
    },
    {
      icon: Devices,
      title: "Multi-Device Instant Sync",
      description: "Access your anime watchlist from your phone, tablet, or desktop with instant cloud synchronization."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO
        title="Anime Tracker – Free Anime Tracking & Episode Watchlist Platform | ListIt"
        description="Track anime online with ListIt, the modern anime tracker. Keep track of watched episodes, discover seasonal anime releases, organize your watchlist, and sync progress instantly."
        keywords="anime tracker, anime tracking, track anime, anime episode tracker, anime list tracker, anime watchlist, anime air schedule, seasonal anime tracker"
        canonical="https://trackwithlistit.vercel.app/anime-tracker"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Anime Tracker', url: '/anime-tracker' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Best Free Anime Tracker"
        title="The Modern, Clean & Lightning Fast"
        highlightText="Anime Tracker"
        subtitle="Keep track of every anime episode, discover upcoming seasonal releases, organize custom watchlists, and never lose your spot again. 100% free and ad-free."
        primaryCtaText="Start Tracking Free"
        primaryCtaLink="/register"
        secondaryCtaText="Browse All Anime"
        secondaryCtaLink="/anime"
        stats={[
          { label: 'Anime in Database', value: '10,000+' },
          { label: 'Episode Log Speed', value: '1-Click' },
          { label: 'Cost to Use', value: '100% Free' }
        ]}
      />

      <LandingFeatures
        sectionTitle="Why Anime Fans Prefer ListIt Tracker"
        sectionSubtitle="Engineered from the ground up for speed, aesthetics, and zero clutter."
        features={features}
      />

      <ComparisonTable
        title="ListIt Anime Tracker vs Outdated Trackers & Spreadsheets"
        subtitle="Experience modern, distraction-free anime tracking with automatic cover art, airing countdowns, and instant updates."
      />

      <LandingFAQ
        title="Anime Tracking Frequently Asked Questions"
        subtitle="Got questions about how to track your anime journey on ListIt? Here are the answers."
        faqs={faqs}
      />

      <LandingCTA
        title="Start Tracking Your Anime Collection Today"
        subtitle="Create your free ListIt account in seconds. Add your current shows, log episodes with one tap, and enjoy anime tracking without ads."
        buttonText="Create Free Anime Watchlist"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
