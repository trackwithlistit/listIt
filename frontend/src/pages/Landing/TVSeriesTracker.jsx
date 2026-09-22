import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import ComparisonTable from './components/ComparisonTable';
import LandingFAQ from './components/LandingFAQ';
import LandingCTA from './components/LandingCTA';
import { Television, PlayCircle, Star, Sparkle, ListNumbers, ShieldCheck } from '@phosphor-icons/react';

export default function TVSeriesTrackerPage() {
  const faqs = [
    {
      question: "What is a TV Series Tracker?",
      answer: "A TV series tracker is an online tool that lets television viewers record which TV shows, seasons, and episodes they have watched. It automatically tracks your current episode, calculates completion percentages, and saves your ratings."
    },
    {
      question: "How does ListIt make tracking TV shows easier?",
      answer: "Instead of writing down episode numbers in notes, ListIt provides 1-click episode increment buttons, automatic cover artwork, descriptions, and organized status lists (Watching, Completed, Plan to Watch, Dropped)."
    },
    {
      question: "Is there an episode limit for long-running TV series?",
      answer: "No. Whether a show has 10 episodes or 500+ episodes, ListIt tracks the full episode count accurately."
    },
    {
      question: "Is ListIt free for tracking TV series?",
      answer: "Yes, ListIt is 100% free with no subscription fees and no intrusive advertisements."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "ListIt TV Series Tracker",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Track TV shows, seasons, and episode progress with ListIt. Comprehensive TV series tracking platform.",
        "url": "https://trackwithlistit.vercel.app/tv-series-tracker"
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
      title: "Complete TV Show Catalog",
      description: "Find drama, sci-fi, comedy, thriller, and documentary series with complete episode overviews."
    },
    {
      icon: PlayCircle,
      title: "Episode Progress Tracking",
      description: "Log your current episode with a single click. Keep accurate percentages of series completion."
    },
    {
      icon: ListNumbers,
      title: "Custom Status Shelves",
      description: "Organize TV shows into Watching, Completed, Plan to Watch, On Hold, and Dropped."
    },
    {
      icon: Star,
      title: "Ratings & Watch Stats",
      description: "Score television shows from 1 to 10 and view comprehensive personal watching stats."
    },
    {
      icon: Sparkle,
      title: "Cross-Platform Access",
      description: "Use ListIt on any browser across desktop, tablet, and mobile with instant cloud synchronization."
    },
    {
      icon: ShieldCheck,
      title: "Ad-Free & Fast",
      description: "Enjoy a blazing fast, modern interface with dark mode and zero intrusive advertising."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO
        title="TV Series Tracker – Track TV Shows, Seasons & Episode Progress | ListIt"
        description="Track TV shows and series with ListIt. Manage your TV series watchlist, log episode progress in 1 click, discover trending television shows, and sync your watch history for free."
        keywords="TV series tracker, TV show tracker, TV episode tracker, track TV shows, series tracker, TV watchlist, TV progress tracker"
        canonical="https://trackwithlistit.vercel.app/tv-series-tracker"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'TV Series Tracker', url: '/tv-series-tracker' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Best TV Series Tracker"
        title="Comprehensive & Effortless"
        highlightText="TV Show Tracker"
        subtitle="Keep track of every season and episode you watch. Manage custom watchlists, discover top-rated TV shows, and stay up to date without ads."
        primaryCtaText="Start Tracking TV Shows"
        primaryCtaLink="/register"
        secondaryCtaText="Browse TV Shows"
        secondaryCtaLink="/series"
        stats={[
          { label: 'TV Shows Available', value: 'Thousands' },
          { label: 'Episode Progress', value: 'Instant (+1)' },
          { label: 'Account Cost', value: '100% Free' }
        ]}
      />

      <LandingFeatures
        sectionTitle="Features Built for TV Series Fans"
        sectionSubtitle="Everything you need to follow multiple TV shows without forgetting where you left off."
        features={features}
      />

      <ComparisonTable
        title="Why ListIt is Better for Tracking TV Shows"
        subtitle="Clean interface, rich episode metadata, and instant synchronization make ListIt the best tracker."
      />

      <LandingFAQ
        title="TV Series Tracking FAQ"
        subtitle="Frequently asked questions about logging and managing television shows on ListIt."
        faqs={faqs}
      />

      <LandingCTA
        title="Start Tracking Your TV Shows on ListIt"
        subtitle="Never lose your place in a TV series again. Join ListIt for free and start tracking your shows today."
        buttonText="Create Free Account"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
