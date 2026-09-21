import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkle, PlayCircle, Star, TrendUp, Flame, CalendarBlank, Trophy, BookmarkSimple } from '@phosphor-icons/react';
import ParticleBackground from '../../components/animations/ParticleBackground';
import AnimeCarousel from '../../components/anime/AnimeCarousel';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';
import anilistAPI from '../../services/anilist';
import { useAuthStore } from '../../store';
import CharacterRow from './sections/CharacterRow';
import SeasonalGrid from './sections/SeasonalGrid';
import UpcomingSection from './sections/UpcomingSection';
import FeaturedHero from './sections/FeaturedHero';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [trending,   setTrending]   = useState([]);
  const [popular,    setPopular]    = useState([]);
  const [topRated,   setTopRated]   = useState([]);
  const [seasonal,   setSeasonal]   = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const currentSeason = useCallback(() => {
    const m = new Date().getMonth() + 1;
    if (m >= 1  && m <= 3)  return { season: 'WINTER', year: new Date().getFullYear() };
    if (m >= 4  && m <= 6)  return { season: 'SPRING', year: new Date().getFullYear() };
    if (m >= 7  && m <= 9)  return { season: 'SUMMER', year: new Date().getFullYear() };
    return { season: 'FALL', year: new Date().getFullYear() };
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      if (trending.length === 0) {
        setLoading(true);
      }
      try {
        const [t, p, tr, s, c] = await Promise.all([
          anilistAPI.getTrending({ perPage: 20 }),
          anilistAPI.getPopular({ perPage: 16 }),
          anilistAPI.getTopRated({ perPage: 16 }),
          anilistAPI.getSeasonal({ ...currentSeason(), perPage: 12 }),
          anilistAPI.getPopularChars({ perPage: 12 }),
        ]);
        setTrending(t.Page?.media || []);
        setPopular(p.Page?.media   || []);
        setTopRated(tr.Page?.media || []);
        setSeasonal(s.Page?.media  || []);
        setCharacters(c.Page?.characters || []);
      } catch (err) {
        console.error('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentSeason]);

  const heroAnime = trending[0];

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO />
      {/* ── HERO ── */}
      <FeaturedHero anime={heroAnime} loading={loading} />

      {/* ── CONTENT ── */}
      <div className="container" style={{ paddingTop: 64 }}>

        {/* Trending */}
        <AnimeCarousel
          icon={Flame}
          title="Trending Now"
          subtitle="What everyone is watching right now"
          viewAllTo="/anime?sort=TRENDING_DESC"
          anime={trending}
          loading={loading}
          cardSize="md"
        />

        {/* Seasonal */}
        <section className="section-gap">
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarBlank size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                This Season
              </h2>
              <p className="section-subtitle">{currentSeason().season} {currentSeason().year}</p>
            </div>
            <Link to="/anime/seasonal" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>
              Full Schedule →
            </Link>
          </div>
          <SeasonalGrid anime={seasonal} loading={loading} />
        </section>

        {/* Popular */}
        <AnimeCarousel
          icon={Star}
          title="Most Popular"
          subtitle="All-time fan favourites"
          viewAllTo="/anime?sort=POPULARITY_DESC"
          anime={popular}
          loading={loading}
          cardSize="md"
        />

        {/* Characters */}
        <section className="section-gap">
          <div className="section-header">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkle size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />
              Top Characters
            </h2>
            <Link to="/search?tab=characters" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>
              See All →
            </Link>
          </div>
          <CharacterRow characters={characters} loading={loading} />
        </section>

        {/* Upcoming */}
        <UpcomingSection />

        {/* Top Rated */}
        <AnimeCarousel
          icon={Trophy}
          title="Top Rated"
          subtitle="The highest scored anime of all time"
          viewAllTo="/anime?sort=SCORE_DESC"
          anime={topRated}
          loading={loading}
          cardSize="lg"
        />

        {/* Web Series Promo Banner */}
        <section className="section-gap">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(6,182,212,0.15) 100%)',
              border: '1px solid rgba(79,70,229,0.3)',
              padding: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 32,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', right: -80, top: -80,
              width: 300, height: 300, borderRadius: '50%',
              background: 'rgba(79,70,229,0.1)',
              filter: 'blur(60px)',
            }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'rgba(6,182,212,0.15)', color: 'var(--accent)',
                  padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(6,182,212,0.25)',
                }}>
                  New
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Now Available</span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800,
                letterSpacing: '-0.03em', marginBottom: 12,
              }}>
                Web Series
                <span style={{ display: 'block', background: 'linear-gradient(90deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Tracking
                </span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.7 }}>
                Track your Netflix, Prime, Disney+ and more. Manage your watchlists, rate seasons, and discover new series with the same powerful tools you love for anime.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/series')}
              icon={<PlayCircle size={20} />}
              style={{ flexShrink: 0, borderColor: 'rgba(79,70,229,0.4)' }}
            >
              Explore Series
            </Button>
          </motion.div>
        </section>

        {/* CTA for non-authenticated */}
        {!isAuthenticated && (
          <section className="section-gap">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                textAlign: 'center',
                padding: '80px 40px',
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 500, height: 300,
                background: 'var(--primary-glow)',
                filter: 'blur(80px)',
                borderRadius: '50%',
                opacity: 0.4,
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 20, color: 'var(--primary-light)' }}>
                  <BookmarkSimple size={32} weight="fill" />
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)',
                  fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16,
                }}>
                  Start Your Journey
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7, fontSize: 'var(--text-lg)' }}>
                  Track every anime you watch, discover hidden gems, and connect with a community of passionate fans.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button size="xl" onClick={() => navigate('/register')} iconRight={<ArrowRight size={18} />}>
                    Create Free Account
                  </Button>
                  <Button variant="ghost" size="xl" onClick={() => navigate('/anime')}>
                    Browse Anime
                  </Button>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
