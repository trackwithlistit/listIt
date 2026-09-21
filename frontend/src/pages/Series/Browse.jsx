import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Television, Funnel, SquaresFour, List, X } from '@phosphor-icons/react';
import SeriesCard from '../../components/series/SeriesCard';
import { SkeletonAnimeGrid } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Footer from '../../components/layout/Footer';
import tvmazeAPI, { isJapaneseAnime } from '../../services/tvmaze';

const SORTS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating',     label: 'Rating (High to Low)' },
  { value: 'title',      label: 'Title (A-Z)' },
  { value: 'newest',     label: 'Newest' },
];

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller'
];

export default function SeriesBrowse() {
  const [params, setParams] = useSearchParams();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // TVMaze is 0-indexed
  const [hasNext, setHasNext] = useState(true);
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const search = params.get('q') || '';
  const sort   = params.get('sort') || 'popularity';
  const genre  = params.get('genre') || '';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
    setFiltersOpen(false);
  };

  const fetchSeries = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      let data = [];
      
      if (search) {
        if (currentPage === 0) {
          const searchData = await tvmazeAPI.searchShows(search);
          data = searchData.map(item => item.show || item);
          setHasNext(false);
        }
      } else {
        data = await tvmazeAPI.getShows(currentPage);
        setHasNext(data.length > 0);
      }

      setSeries((prev) => reset ? data : [...prev, ...data]);
      if (reset) setPage(1);
      else if (!search) setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // Reset on search change
  useEffect(() => {
    setSeries([]);
    setPage(0);
    fetchSeries(true);
  }, [search]);

  // Infinite scroll loader reference
  const loaderRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasNext && !loading && !search) fetchSeries(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNext, loading, fetchSeries, search]);

  // Filter & Sort series locally
  const displaySeries = [...series]
    .filter((s) => {
      const show = s.show || s;
      if (isJapaneseAnime(show)) return false;
      if (genre && show.genres) {
        return show.genres.some((g) => g.toLowerCase() === genre.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const showA = a.show || a;
      const showB = b.show || b;
      if (sort === 'rating') {
        return (showB.rating?.average || 0) - (showA.rating?.average || 0);
      }
      if (sort === 'title') {
        return (showA.name || '').localeCompare(showB.name || '');
      }
      if (sort === 'newest') {
        return new Date(showB.premiered || 0) - new Date(showA.premiered || 0);
      }
      return 0;
    });

  const activeFiltersCount = (genre ? 1 : 0) + (search ? 1 : 0);

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(6,182,212,0.08) 100%)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'calc(var(--navbar-h) + 40px)',
        paddingBottom: 40,
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              flexShrink: 0,
            }}>
              <Television size={24} weight="fill" color="#fff" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>
              Web Series
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Track Netflix, Prime, HBO, and more</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          
          {/* Search */}
          <input 
            type="text" 
            placeholder="Search shows..." 
            value={search}
            onChange={(e) => setParam('q', e.target.value)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              padding: '8px 12px', fontSize: 'var(--text-sm)', flex: 1, maxWidth: 300,
            }}
          />

          {/* Sort Dropdown */}
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
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Filter Button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Funnel size={16} />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{
              borderColor: filtersOpen || genre ? '#06B6D4' : 'var(--border)',
              color: filtersOpen || genre ? '#06B6D4' : 'var(--text-secondary)'
            }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={clearAll}>
              Clear
            </Button>
          )}

          {/* View Mode Toggle (Grid vs List) */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {[{ v: 'grid', Icon: SquaresFour }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: view === v ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
                  border: `1px solid ${view === v ? '#06B6D4' : 'var(--border)'}`,
                  color: view === v ? '#06B6D4' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 24,
                overflow: 'hidden'
              }}
            >
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.05em' }}>
                Filter by Genre
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setParam('genre', '')}
                  style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: !genre ? '#06B6D4' : 'var(--bg-elevated)',
                    color: !genre ? '#FFF' : 'var(--text-secondary)',
                    border: `1px solid ${!genre ? '#06B6D4' : 'var(--border)'}`,
                  }}
                >
                  All Genres
                </button>
                {GENRES.map((g) => {
                  const isActive = genre.toLowerCase() === g.toLowerCase();
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setParam('genre', isActive ? '' : g)}
                      style={{
                        padding: '4px 12px', borderRadius: 'var(--radius-full)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: isActive ? '#06B6D4' : 'var(--bg-elevated)',
                        color: isActive ? '#FFF' : 'var(--text-secondary)',
                        border: `1px solid ${isActive ? '#06B6D4' : 'var(--border)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Series List / Grid */}
        {displaySeries.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid'
              ? 'repeat(auto-fill, minmax(180px, 1fr))'
              : '1fr',
            gap: view === 'grid' ? 20 : 12,
          }}>
            {displaySeries.map((s, i) => (
              <motion.div
                key={`${(s.show || s).id}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
              >
                <SeriesCard series={s} view={view} size="md" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displaySeries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No web series found</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 20 }}>Try clearing filters or searching for another show</p>
            <Button variant="outline" size="sm" onClick={clearAll}>Clear Filters</Button>
          </div>
        )}

        {/* Skeleton */}
        {loading && series.length === 0 && <SkeletonAnimeGrid count={24} />}

        {/* Infinite scroll loader */}
        {!search && !genre && (
          <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
            {loading && series.length > 0 && (
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #06B6D4', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
