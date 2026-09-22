import SEO from '../../components/seo/SEO';
import Footer from '../../components/layout/Footer';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import ComparisonTable from './components/ComparisonTable';
import LandingFAQ from './components/LandingFAQ';
import LandingCTA from './components/LandingCTA';
import { ListNumbers, BookmarkSimple, SlidersHorizontal, Sparkle, Tag, Folder } from '@phosphor-icons/react';

export default function AnimeWatchlistPage() {
  const faqs = [
    {
      question: "How do I create and manage my anime watchlist?",
      answer: "Creating an anime watchlist on ListIt takes just seconds. Simply create a free account, search for any anime title, and click 'Add to List'. You can set the initial status to Watching, Plan to Watch, or Completed."
    },
    {
      question: "Can I organize my anime into custom categories and statuses?",
      answer: "Yes. ListIt provides 5 standard status buckets (Currently Watching, Completed, Plan to Watch, On Hold, Dropped) plus custom scoring (1-10 rating scale) and personal notes."
    },
    {
      question: "Is there a limit on how many anime I can save?",
      answer: "No. You can add unlimited anime shows, movies, OVAs, and specials to your ListIt watchlist completely free."
    },
    {
      question: "Can I share my anime watchlist with friends?",
      answer: "Yes! Every ListIt user gets a public profile URL (e.g., /profile/yourusername) that you can easily share on Discord, Twitter, or social media."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Anime Watchlist – Organize & Manage Your Anime Collection | ListIt",
        "url": "https://trackwithlistit.vercel.app/anime-watchlist",
        "description": "Create and organize your ultimate anime watchlist. Categorize shows into Watching, Completed, Plan to Watch, On Hold, and Dropped with custom scores and notes."
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
      icon: ListNumbers,
      title: "5 Distinct Status Lists",
      description: "Keep your anime library neatly segmented across Watching, Completed, Plan to Watch, On Hold, and Dropped."
    },
    {
      icon: SlidersHorizontal,
      title: "Sort & Filter Instantly",
      description: "Filter your watchlist by score, release season, title, or progress to find what to watch next in seconds."
    },
    {
      icon: BookmarkSimple,
      title: "Personal Scores & Notes",
      description: "Log your ratings from 1 to 10 and attach personal thoughts or re-watch tags to any anime."
    },
    {
      icon: Tag,
      title: "Genre & Studio Breakdown",
      description: "See what genres and animation studios you watch the most with automatic profile statistics."
    },
    {
      icon: Folder,
      title: "Unlimited Library Storage",
      description: "Add hundreds or thousands of anime series, films, and OVAs with zero restrictions."
    },
    {
      icon: Sparkle,
      title: "Shareable Public Profile",
      description: "Show off your curated anime watchlist and ratings with your personalized public profile link."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO
        title="Anime Watchlist – Organize & Manage Your Anime Collection | ListIt"
        description="Build your ultimate anime watchlist with ListIt. Organize your anime into Watching, Completed, and Plan to Watch lists, rate shows, and share your anime library with friends."
        keywords="anime watchlist, anime list, anime tracking list, create anime watchlist, anime collection, anime tracker list, my anime list alternative"
        canonical="https://trackwithlistit.vercel.app/anime-watchlist"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Anime Watchlist', url: '/anime-watchlist' }
        ]}
        structuredData={structuredData}
      />

      <LandingHero
        badge="Ultimate Anime Watchlist"
        title="Create & Organize Your Ultimate"
        highlightText="Anime Watchlist"
        subtitle="The cleanest way to organize your anime library. Categorize shows, track your progress, rate series, and share your favorite anime with the community."
        primaryCtaText="Build Your Watchlist"
        primaryCtaLink="/register"
        secondaryCtaText="Explore Anime"
        secondaryCtaLink="/anime"
        stats={[
          { label: 'Watchlist Limits', value: 'Unlimited' },
          { label: 'List Statuses', value: '5 Categories' },
          { label: 'Profile Sharing', value: 'Enabled' }
        ]}
      />

      <LandingFeatures
        sectionTitle="Designed for True Anime Collectors"
        sectionSubtitle="Everything you need to catalog, score, and manage your growing anime collection."
        features={features}
      />

      <ComparisonTable
        title="Why ListIt is the Modern Anime Watchlist Solution"
        subtitle="Ditch complicated spreadsheets and clunky retro websites for an elegant, high-speed watchlist."
      />

      <LandingFAQ
        title="Anime Watchlist Frequently Asked Questions"
        subtitle="Find answers to common questions about setting up and organizing your anime watchlist."
        faqs={faqs}
      />

      <LandingCTA
        title="Build Your Free Anime Watchlist in Seconds"
        subtitle="Sign up for free, add your favorite anime titles, and experience a cleaner way to track what you watch."
        buttonText="Get Started Free"
        buttonLink="/register"
      />

      <Footer />
    </div>
  );
}
