import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Funnel, SquaresFour, List, X } from '@phosphor-icons/react';
import AnimeCard from '../../components/anime/AnimeCard';
import { SkeletonAnimeGrid } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Footer from '../../components/layout/Footer';
import NikaIcon from '../../components/ui/NikaIcon';
import anilistAPI from '../../services/anilist';
import { useAdultStore } from '../../store';

const GENRES = ['Action','Adventure','Comedy','Drama','Ecchi','Fantasy','Hentai','Horror','Mahou Shoujo','Mecha','Music','Mystery','Psychological','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller'];
const SEASONS = ['WINTER','SPRING','SUMMER','FALL'];
const FORMATS  = ['TV','MOVIE','OVA','ONA','SPECIAL','MUSIC'];
const STATUSES = ['RELEASING','FINISHED','NOT_YET_RELEASED','CANCELLED'];
const SORTS    = [
  { label: 'Trending', value: 'TRENDING_DESC' },
  { label: 'Popularity', value: 'POPULARITY_DESC' },
  { label: 'Score', value: 'SCORE_DESC' },
  { label: 'Newest', value: 'START_DATE_DESC' },
  { label: 'Oldest', value: 'START_DATE' },
  { label: 'A-Z', value: 'TITLE_ROMAJI' },
];

export default function AnimeBrowse() {
  const { unblurAdult, toggleUnblurAdult } = useAdultStore();
  const [params, setParams] = useSearchParams();
  const [anime,   setAnime]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(true);
  const [view,    setView]    = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const loaderRef = useRef(null);

  const sort   = params.get('sort')   || 'TRENDING_DESC';
  const genre  = params.get('genre')  || '';
  const status = params.get('status') || '';
  const format = params.get('format') || '';
  const search = params.get('q')      || '';

  // Use a ref to track page so fetchAnime doesn't go stale
  const pageRef = useRef(1);

  const fetchAnime = useCallback(async (reset = false) => {
    if (reset) {
      pageRef.current = 1;
    }
    setLoading(true);
    try {
      const data = await anilistAPI.searchAnime({
        search: search || undefined,
        sort: [sort],
        genre: genre || undefined,
        status: status || undefined,
        format: format || undefined,
        page: pageRef.current,
        perPage: 24,
      });
      const mediaList = data.Page?.media || [];
      const info      = data.Page?.pageInfo;
      if (reset) {
        setAnime(mediaList);
      } else {
        setAnime((prev) => {
          // De-duplicate by ID before appending
          const existingIds = new Set(prev.map(a => a.id));
          const newItems = mediaList.filter(a => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
      }
      setHasNext(info?.hasNextPage || false);
      pageRef.current = pageRef.current + 1;
    } catch (err) {
      console.error('Anime Browse fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [sort, genre, status, format, search]);  // page is NO longer a dep — uses ref instead

  // Reset on filter/sort change only
  useEffect(() => {
    setAnime([]);
    fetchAnime(true);
  }, [sort, genre, status, format, search]);  // fetchAnime itself is stable

  // Infinite scroll — only trigger when not loading and has more pages
  const scrollFetchedRef = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading && !scrollFetchedRef.current) {
          scrollFetchedRef.current = true;
          fetchAnime(false).then(() => { scrollFetchedRef.current = false; });
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNext, loading, fetchAnime]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const activeFilters = [genre, status, format].filter(Boolean).length;

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-deep) 100%)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'calc(var(--navbar-h) + 40px)',
        paddingBottom: 40,
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
              padding: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.45), 0 4px 14px rgba(0,0,0,0.5)',
              flexShrink: 0,
            }}>
              <NikaIcon size={44} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>
              Anime
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Discover and track thousands of anime series</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          
          {/* Search */}
          <input 
            type="text" 
            placeholder="Search anime..." 
            value={search}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setParams(next, { replace: true });
            }}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              padding: '8px 12px', fontSize: 'var(--text-sm)', flex: 1, maxWidth: 300,
            }}
          />

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              padding: '8px 12px', fontSize: 'var(--text-sm)', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Filter button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Funnel size={16} />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>

          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={clearAll}>
              Clear
            </Button>
          )}

          {/* View toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {[{ v: 'grid', Icon: SquaresFour }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: view === v ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                  border: `1px solid ${view === v ? 'var(--primary)' : 'var(--border)'}`,
                  color: view === v ? 'var(--primary-light)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24,
            }}
          >
            {/* Genre */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Genre</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {GENRES.map((g) => (
                  <button key={g} onClick={() => setParam('genre', genre === g ? '' : g)}
                    style={{
                      padding: '5px 12px', borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer',
                      background: genre === g ? 'var(--primary-subtle)' : 'var(--bg-card)',
                      border: `1px solid ${genre === g ? 'var(--primary)' : 'var(--border)'}`,
                      color: genre === g ? 'var(--primary-light)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Format & Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Format</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {FORMATS.map((f) => (
                    <button key={f} onClick={() => setParam('format', format === f ? '' : f)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer',
                        background: format === f ? 'var(--accent-subtle)' : 'var(--bg-card)',
                        border: `1px solid ${format === f ? 'var(--accent)' : 'var(--border)'}`,
                        color: format === f ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => setParam('status', status === s ? '' : s)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer',
                        background: status === s ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
                        border: `1px solid ${status === s ? '#10B981' : 'var(--border)'}`,
                        color: status === s ? '#10B981' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Adult Content Safety & Unblur Sticky Bar */}
        {/* Shown when filters are open OR when Hentai/Adult filter is active */}
        {/* Sticks right below navbar when scrolling down, re-anchors to filter section when scrolling up */}
        {(filtersOpen || genre.toLowerCase() === 'hentai') && (
          <div style={{
            position: 'sticky',
            top: 'calc(var(--navbar-h) + 12px)',
          zIndex: 35,
          background: 'rgba(17, 18, 23, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          padding: '12px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          transition: 'all 0.25s ease',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔞</span> Unblur Adult Covers
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              {unblurAdult
                ? 'Covers unblurred (White censorship spots active for nudity spots)'
                : 'All adult/hentai cover images are completely blurred by default for safety'}
            </p>
          </div>
          
          <button
            onClick={toggleUnblurAdult}
            type="button"
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: unblurAdult ? 'var(--primary)' : 'var(--bg-card)',
              border: `1px solid ${unblurAdult ? 'var(--primary)' : 'var(--border)'}`,
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <motion.div
              animate={{ x: unblurAdult ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#FFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>
        )}

        {/* Grid */}
        {anime.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid'
              ? 'repeat(auto-fill, minmax(180px, 1fr))'
              : '1fr',
            gap: 20,
          }}>
            {anime.map((a, i) => (
              <motion.div
                key={`${a.id}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
              >
                {view === 'grid' ? (
                  <AnimeCard anime={a} size="md" />
                ) : (
                  <ListViewCard anime={a} />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Skeleton */}
        {loading && anime.length === 0 && <SkeletonAnimeGrid count={24} />}

        {/* Infinite scroll loader */}
        <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
          {loading && anime.length > 0 && (
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ListViewCard({ anime }) {
  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'center',
      padding: '12px 16px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
    >
      <img src={anime.coverImage?.medium} alt={anime.title?.romaji} style={{ width: 56, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 4 }}>
          {anime.title?.english || anime.title?.romaji}
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          <span>{anime.format}</span>
          <span>{anime.episodes} eps</span>
          <span>{anime.season} {anime.seasonYear}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {anime.genres?.slice(0, 4).map((g) => (
            <span key={g} style={{ fontSize: 10, background: 'var(--primary-subtle)', color: 'var(--primary-light)', padding: '2px 7px', borderRadius: 4 }}>{g}</span>
          ))}
        </div>
      </div>
      {anime.averageScore && (
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: '#F59E0B' }}>
            {(anime.averageScore / 10).toFixed(1)}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Score</p>
        </div>
      )}
    </div>
  );
}
