import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import anilistAPI from '../../services/anilist';
import AnimeCard from '../../components/anime/AnimeCard';
import { SkeletonAnimeGrid } from '../../components/ui/Skeleton';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';

const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
const SEASON_LABELS = { WINTER: '❄️ Winter', SPRING: '🌸 Spring', SUMMER: '☀️ Summer', FALL: '🍂 Fall' };

function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  if (m <= 3)  return 'WINTER';
  if (m <= 6)  return 'SPRING';
  if (m <= 9)  return 'SUMMER';
  return 'FALL';
}

const BASE_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => BASE_YEAR - i);

export default function SeasonalPage() {
  const [params, setParams] = useSearchParams();
  const [anime,   setAnime]   = useState([]);
  const [loading, setLoading] = useState(true);

  const season = params.get('season') || getCurrentSeason();
  const year   = Number(params.get('year')) || BASE_YEAR;

  useEffect(() => {
    setLoading(true);
    anilistAPI.getSeasonal({ season, year, perPage: 50 })
      .then((d) => setAnime(d.Page?.media || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [season, year]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next);
  };

  // Group by status
  const airing    = anime.filter((a) => a.status === 'RELEASING');
  const upcoming  = anime.filter((a) => a.status === 'NOT_YET_RELEASED');
  const finished  = anime.filter((a) => a.status === 'FINISHED');

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO 
        title={`Seasonal Anime ${year} (${season.charAt(0) + season.slice(1).toLowerCase()})`}
        description={`Discover airing and upcoming anime for ${season.charAt(0) + season.slice(1).toLowerCase()} ${year}. Track seasonal release schedules and charts on ListIt.`}
        canonical={`https://trackwithlistit.vercel.app/anime/seasonal?season=${season}&year=${year}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Anime', url: '/anime' },
          { name: 'Seasonal Anime', url: '/anime/seasonal' }
        ]}
      />
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-deep) 100%)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'calc(var(--navbar-h) + 40px)',
        paddingBottom: 40,
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Seasonal Anime
          </h1>

          {/* Season tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {SEASONS.map((s) => (
              <button key={s} onClick={() => setParam('season', s)}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  fontWeight: 600, fontSize: 'var(--text-sm)',
                  background: season === s ? 'var(--primary)' : 'var(--bg-card)',
                  border: `1px solid ${season === s ? 'var(--primary)' : 'var(--border)'}`,
                  color: season === s ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}>
                {SEASON_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {YEARS.map((y) => (
              <button key={y} onClick={() => setParam('year', y)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12,
                  background: year === y ? 'var(--accent-subtle)' : 'transparent',
                  border: `1px solid ${year === y ? 'var(--accent)' : 'var(--border)'}`,
                  color: year === y ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}>
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {loading ? <SkeletonAnimeGrid count={24} /> : (
          <>
            {airing.length > 0 && (
              <section className="section-gap">
                <h2 className="section-title" style={{ marginBottom: 20 }}>🟢 Currently Airing</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                  {airing.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                      <AnimeCard anime={a} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section className="section-gap">
                <h2 className="section-title" style={{ marginBottom: 20 }}>🟡 Upcoming</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                  {upcoming.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                      <AnimeCard anime={a} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
            {finished.length > 0 && (
              <section className="section-gap">
                <h2 className="section-title" style={{ marginBottom: 20 }}>✅ Finished</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                  {finished.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                      <AnimeCard anime={a} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
