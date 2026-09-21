import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, X, Clock, Users } from '@phosphor-icons/react';
import anilistAPI from '../../services/anilist';
import tvmazeAPI, { isJapaneseAnime } from '../../services/tvmaze';
import { intelligentCharacterSearch, prefetchPopularCharacters } from '../../services/smartSearch';
import AnimeCard from '../../components/anime/AnimeCard';
import SeriesCard from '../../components/series/SeriesCard';
import { Skeleton } from '../../components/ui/Skeleton';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';

const TABS = ['Anime', 'Web Series', 'Characters', 'Studios'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(params.get('q') || '');
  const [activeTab,  setActiveTab]  = useState('Anime');
  const [results,    setResults]    = useState({
    anime: [],
    series: [],
    characters: [],
    relatedCharacters: [],
    similarCharacters: [],
    targetCharacter: null,
    studios: []
  });
  const [loading,    setLoading]    = useState(false);
  const [recent,     setRecent]     = useState(() => JSON.parse(localStorage.getItem('listit_recent_searches') || '[]'));
  const [correction, setCorrection] = useState(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState(params.get('q') || '');
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => { 
    inputRef.current?.focus(); 
    prefetchPopularCharacters();
    if (params.get('q')) {
      handleExecuteSearch(params.get('q'));
    }
  }, []);

  const handleExecuteSearch = async (searchTerm, isStrict = false) => {
    const q = (searchTerm || '').trim();
    if (!q) {
      setResults({ anime: [], series: [], characters: [], relatedCharacters: [], similarCharacters: [], targetCharacter: null, studios: [] });
      setCorrection(null);
      setActiveSearchQuery('');
      return;
    }

    // Cancel in-flight stale requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setCorrection(null);
    setActiveSearchQuery(q);
    setInputValue(q);
    setParams({ q }, { replace: true });

    try {
      const [animeData, seriesData, charResult, studioData] = await Promise.all([
        anilistAPI.searchAnime({ search: q }),
        tvmazeAPI.searchShows(q),
        intelligentCharacterSearch(q, { signal, strict: isStrict }),
        anilistAPI.searchStudios({ search: q }),
      ]);
      
      const anime = animeData.Page?.media || [];
      const chars = charResult.characters || [];
      const cleanSeries = (seriesData || []).filter(s => !isJapaneseAnime(s.show || s));
      
      // Auto-switch tabs if character query strongly matches characters or anime matches are weak
      const isCharacterSearch = chars.length > 0 && (
        anime.length === 0 || 
        charResult.suggestedCorrection || 
        chars.some(c => (c.name?.full || '').toLowerCase().includes(q.toLowerCase()))
      );

      if (isCharacterSearch && activeTab === 'Anime') {
        setActiveTab('Characters');
      }

      setResults({
        anime:             anime,
        series:            cleanSeries,
        characters:        chars,
        relatedCharacters: charResult.relatedCharacters || [],
        similarCharacters: charResult.similarCharacters || [],
        targetCharacter:   charResult.target           || null,
        studios:           studioData.Page?.studios    || [],
      });
      
      if (!isStrict && charResult.correction) {
        setCorrection(charResult.correction);
      }

      // Save to recent
      const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
      setRecent(updated);
      localStorage.setItem('listit_recent_searches', JSON.stringify(updated));
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        console.error('[Search Error]:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleExecuteSearch(inputValue);
    }
  };

  const clearRecent = () => { setRecent([]); localStorage.removeItem('listit_recent_searches'); };

  const counts = {
    Anime:      results.anime.length,
    'Web Series': results.series.length,
    Characters: results.characters.length,
    Studios:    results.studios.length,
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingTop: 'var(--navbar-h)' }}>
      <SEO 
        title={activeSearchQuery ? `Search: ${activeSearchQuery}` : 'Search Anime & Series'} 
        description="Search for your favorite anime, web series, characters, and voice actors across the comprehensive ListIt database."
        canonical="https://listit.app/search"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Search', url: '/search' }
        ]}
      />
      {/* Search header */}
      <div style={{
        background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
        padding: '32px 0',
        position: 'sticky', top: 'var(--navbar-h)', zIndex: 'var(--z-raised)',
      }}>
        <div className="container">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '12px 20px',
            boxShadow: 'var(--shadow-md)',
          }}>
            <button onClick={() => handleExecuteSearch(inputValue)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <MagnifyingGlass size={22} color="var(--text-muted)" />
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search anime, characters, studios... (Press Enter)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 'var(--text-lg)', color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
            {inputValue && (
              <button onClick={() => { setInputValue(''); setResults({ anime: [], series: [], characters: [], relatedCharacters: [], similarCharacters: [], targetCharacter: null, studios: [] }); setActiveSearchQuery(''); }} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            )}
          </div>

          {/* Tabs */}
          {activeSearchQuery && (
            <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '7px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                    fontWeight: 500, fontSize: 'var(--text-sm)',
                    background: activeTab === tab ? 'var(--primary-subtle)' : 'transparent',
                    border: `1px solid ${activeTab === tab ? 'var(--primary)' : 'var(--border)'}`,
                    color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}>
                  {tab} {!loading && counts[tab] > 0 && `(${counts[tab]})`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Empty / Recent */}
        {!activeSearchQuery && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {recent.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} /> Recent Searches
                  </h3>
                  <button onClick={clearRecent} style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>Clear</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recent.map((r) => (
                    <button key={r} onClick={() => { setInputValue(r); handleExecuteSearch(r); }}
                      style={{
                        padding: '7px 16px', borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <MagnifyingGlass size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>Search ListIt</h2>
              <p style={{ fontSize: 'var(--text-sm)' }}>Find anime, characters, voice actors, and studios</p>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton height={256} borderRadius="var(--radius-lg)" style={{ marginBottom: 10 }} />
                <Skeleton height={16} width="80%" style={{ marginBottom: 6 }} />
                <Skeleton height={12} width="50%" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && activeSearchQuery && (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === 'Anime' && (
                <>
                  {results.anime.length === 0 ? (
                    <EmptyResults query={activeSearchQuery} type="anime" />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                      {results.anime.map((a) => <AnimeCard key={a.id} anime={a} />)}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Web Series' && (
                <>
                  {results.series.length === 0 ? (
                    <EmptyResults query={activeSearchQuery} type="web series" />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                      {results.series.map((s) => <SeriesCard key={s.show?.id || s.id} series={s.show || s} />)}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Characters' && (
                <>
                  {/* Google-Style Interactive 3-State Clarification Banners */}
                  {correction && (
                    <div style={{ marginBottom: 24, padding: '14px 18px', background: 'var(--bg-elevated)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                      {correction.state === 'DID_YOU_MEAN' && (
                        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-md)', margin: 0 }}>
                          Did you mean <strong onClick={() => handleExecuteSearch(correction.suggested)} style={{ color: 'var(--primary-light)', cursor: 'pointer', textDecoration: 'underline' }}>"{correction.suggested}"</strong>?
                        </p>
                      )}
                      {correction.state === 'INCLUDING_RESULTS' && (
                        <div>
                          <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-md)', marginBottom: 4 }}>
                            Including results for <strong onClick={() => handleExecuteSearch(correction.suggested)} style={{ color: 'var(--primary-light)', cursor: 'pointer', textDecoration: 'underline' }}>{correction.suggested}</strong>
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
                            Search only for <span onClick={() => handleExecuteSearch(correction.original, true)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>{correction.original}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {results.characters.length === 0 ? <EmptyResults query={activeSearchQuery} type="characters" /> : (
                    <div>
                      {/* Character Cards Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
                        {results.characters.map((c) => (
                          <div key={c.id} style={{ textAlign: 'center' }}>
                            <img src={c.image?.large} alt={c.name?.full} referrerPolicy="no-referrer" style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }} />
                            <p style={{ fontWeight: 700, fontSize: 'var(--text-md)', marginBottom: 4, color: 'var(--text-primary)' }}>{c.name?.full}</p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {c.media?.nodes?.[0]?.title?.english || c.media?.nodes?.[0]?.title?.romaji || 'ANIME'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Studios' && (
                results.studios.length === 0 ? <EmptyResults query={activeSearchQuery} type="studios" /> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {results.studios.map((s) => (
                      <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>{s.name}</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {s.media?.nodes?.slice(0, 4).map((m) => (
                            <Link key={m.id} to={`/anime/${m.id}`} style={{ textDecoration: 'none' }}>
                              <img src={m.coverImage?.medium} alt={m.title?.romaji} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <Footer />
    </div>
  );
}

function EmptyResults({ query, type }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
        No {type} found for "{query}"
      </h3>
      <p style={{ fontSize: 'var(--text-sm)' }}>Try different keywords or check your spelling</p>
    </div>
  );
}
