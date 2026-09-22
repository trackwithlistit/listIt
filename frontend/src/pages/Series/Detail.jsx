import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, BookmarkSimple, Share, PlayCircle, Info,
  Users, FilmSlate, ArrowLeft, CheckCircle, Plus, Minus,
} from '@phosphor-icons/react';
import tvmazeAPI from '../../services/tvmaze';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';
import { useAuthStore, useSeriesListStore } from '../../store';
import { seriesListAPI } from '../../services/backend';
import toast from 'react-hot-toast';

function ScoreRing({ score, size = 80 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  const color = score >= 7.5 ? '#10B981' : score >= 6.0 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: size * 0.22, color }}>
          {score.toFixed(1)}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>SCORE</span>
      </div>
    </div>
  );
}

function AddToListModal({ isOpen, onClose, series, onSave }) {
  const getEntryForSeriesSeason = useSeriesListStore((s) => s.getEntryForSeriesSeason);
  const seasons = (series?._embedded?.seasons || []).filter(s => s.number > 0);
  const seasonScrollRef = useRef(null);

  // Native (non-passive) wheel listener so we can preventDefault and redirect
  // vertical scroll to horizontal ONLY when mouse is over the season selector row.
  useEffect(() => {
    const el = seasonScrollRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const [activeSeason, setActiveSeason] = useState(seasons[0] || null);
  
  const currentEntry = activeSeason ? getEntryForSeriesSeason(series?.id, activeSeason.id) : null;

  const STATUS_OPTIONS = [
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'rewatching', label: 'Rewatching' },
  ];
  const [status, setStatus] = useState('plan_to_watch');
  const [score,  setScore]  = useState(0);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentEntry) {
      setStatus(currentEntry.status);
      setScore(currentEntry.score || 0);
      setProgress(currentEntry.progress || 0);
    } else {
      setStatus('plan_to_watch');
      setScore(0);
      setProgress(0);
    }
  }, [currentEntry, activeSeason]);

  const maxEps = activeSeason ? (series?._embedded?.episodes?.filter(e => e.season === activeSeason.number).length || activeSeason.episodeOrder || 0) : 0;

  useEffect(() => {
    if (status === 'completed' && maxEps > 0) {
      setProgress(maxEps);
    }
  }, [status, maxEps]);

  useEffect(() => {
    if (maxEps > 0) {
      if (progress === maxEps && status !== 'completed' && status !== 'rewatching') {
        setStatus('completed');
      } else if (progress < maxEps && status === 'completed') {
        setStatus('watching');
      }
    }
    if (progress > 0 && status === 'plan_to_watch') {
      setStatus('watching');
    }
  }, [progress, maxEps]);

  const handleSave = async () => {
    if (!activeSeason) return;
    let finalStatus = status;
    // Auto-complete if progress reaches max episodes
    if (maxEps > 0 && progress === maxEps && finalStatus !== 'completed' && finalStatus !== 'rewatching') {
      finalStatus = 'completed';
    } else if (progress > 0 && finalStatus === 'plan_to_watch') {
      finalStatus = 'watching';
    }

    if ((finalStatus === 'completed' || finalStatus === 'rewatching') && series?.status === 'Running' && activeSeason.number === seasons[seasons.length - 1]?.number) {
       // Wait, if a season is done but the series is running, they CAN complete the season!
       // So we shouldn't block completing a season just because the overall series is running!
       // Actually I'll let them complete any season, it's fine.
    }
    
    setSaving(true);
    await onSave({ 
      status: finalStatus, 
      score, 
      progress,
      season_id: activeSeason.id,
      season_number: activeSeason.number
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add to List — ${series?.name}`} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Season Selector */}
        {seasons.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Season</p>
            <div
              ref={seasonScrollRef}
              style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
              {seasons.map((s) => (
                <button key={s.id} onClick={() => {
                  setActiveSeason(s);
                  // Immediately reset form so stale state from the previous season
                  // doesn't bleed through during the one render before useEffect fires.
                  const nextEntry = getEntryForSeriesSeason(series?.id, s.id);
                  if (nextEntry) {
                    setStatus(nextEntry.status);
                    setScore(nextEntry.score || 0);
                    setProgress(nextEntry.progress || 0);
                  } else {
                    setStatus('plan_to_watch');
                    setScore(0);
                    setProgress(0);
                  }
                }}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
                    background: activeSeason?.id === s.id ? 'var(--primary)' : 'var(--bg-elevated)',
                    border: '1px solid', borderColor: activeSeason?.id === s.id ? 'var(--primary)' : 'var(--border)',
                    color: activeSeason?.id === s.id ? '#FFF' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s ease'
                  }}>
                  Season {s.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STATUS_OPTIONS.map((o) => {
              return (
                <button key={o.value} onClick={() => setStatus(o.value)}
                  style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                    background: status === o.value ? 'rgba(79,70,229,0.15)' : 'var(--bg-card)',
                    border: `1px solid ${status === o.value ? '#4F46E5' : 'var(--border)'}`,
                    color: status === o.value ? '#4F46E5' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Score */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Score: {score > 0 ? score : 'Unrated'}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setScore(score === n ? 0 : n)}
                style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: score === n ? '#F59E0B' : 'var(--bg-elevated)',
                  border: `1px solid ${score === n ? '#F59E0B' : 'var(--border)'}`,
                  color: score === n ? '#000' : 'var(--text-muted)',
                  fontWeight: 700, cursor: 'pointer', fontSize: 'var(--text-sm)',
                  transition: 'all 0.15s ease',
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Progress: {progress} {maxEps > 0 ? `/ ${maxEps}` : ''} episodes watched
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setProgress(Math.max(0, progress - 1))}
              style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Minus size={14} />
            </button>
            {maxEps > 0 ? (
              <input type="range" min={0} max={maxEps} value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }} />
            ) : (
              <input type="number" min={0} value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text-primary)' }} />
            )}
            <button onClick={() => setProgress(maxEps > 0 ? Math.min(maxEps, progress + 1) : progress + 1)}
              style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        <Button onClick={handleSave} loading={saving} fullWidth disabled={!activeSeason}>
          {currentEntry ? 'Update Season List' : 'Save Season to List'}
        </Button>
      </div>
    </Modal>
  );
}

export default function SeriesDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  
  const getAllEntriesForSeries = useSeriesListStore((s) => s.getAllEntriesForSeries);
  const getEntryForSeriesSeason = useSeriesListStore((s) => s.getEntryForSeriesSeason);
  const addEntry = useSeriesListStore((s) => s.addEntry);
  const updateEntry = useSeriesListStore((s) => s.updateEntry);

  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listModalOpen, setListModalOpen] = useState(false);

  const allEntries = series ? getAllEntriesForSeries(series.id) : [];
  const maxEps = series?._embedded?.episodes?.length || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    tvmazeAPI.getShowDetails(Number(id))
      .then((d) => setSeries(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveList = async ({ status, score, progress, season_id, season_number }) => {
    if (!isAuthenticated) { toast.error('Please log in first'); return; }
    try {
      // Find the specific entry for this season
      const entry = getEntryForSeriesSeason(series.id, season_id);
      
      const payload = { 
        tvmaze_id: series.id, 
        season_id,
        season_number,
        title: `${series.name} Season ${season_number}`,
        media_type: 'series', 
        status, 
        score, 
        progress,
        total_episodes: series._embedded?.episodes?.filter(e => e.season === season_number).length || 0,
        genres: series.genres || [],
        media_status: series.status
      };
      
      if (entry) {
        const { data } = await seriesListAPI.updateEntry(entry._id, payload);
        updateEntry(entry._id, data);
        toast.success('Season list updated!');
      } else {
        const { data } = await seriesListAPI.addEntry(payload);
        addEntry(data);
        toast.success('Season added to list!');
      }
    } catch (err) {
      console.error('Save error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to save. Try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingTop: 'var(--navbar-h)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingTop: 'var(--navbar-h)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Series not found</h2>
      </div>
    );
  }

  const cover = series.image?.original || series.image?.medium;
  const platform = series.webChannel?.name || series.network?.name;
  const description = series.summary?.replace(/<[^>]*>/g, '') || '';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": series.name,
    "description": description,
    "image": cover || '',
    "dateCreated": series.premiered || undefined,
    "aggregateRating": series.rating?.average ? {
      "@type": "AggregateRating",
      "ratingValue": series.rating.average,
      "bestRating": "10",
      "ratingCount": series.weight || 1
    } : undefined
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingBottom: 80 }}>
      <SEO 
        title={series.name} 
        description={description.substring(0, 160) + (description.length > 160 ? '...' : '')} 
        image={cover}
        type="video.tv_show"
        canonical={`https://trackwithlistit.vercel.app/series/${id}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Web Series', url: '/series' },
          { name: series.name || 'Detail', url: `/series/${id}` }
        ]}
        structuredData={structuredData}
      />
      {/* Banner / Header */}
      <div style={{
        position: 'relative', width: '100%', height: '50vh', minHeight: 500,
        background: 'var(--bg-elevated)', overflow: 'hidden',
      }}>
        {/* Blur backdrop */}
        {cover && (
          <div style={{
            position: 'absolute', inset: -20,
            backgroundImage: `url(${cover})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(30px)', opacity: 0.25,
            zIndex: 0,
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg-deep) 0%, rgba(5,5,8,0.4) 100%)',
          zIndex: 1,
        }} />

        {/* Content */}
        <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: 40 }}>
          <Link to="/series" style={{ position: 'absolute', top: 'calc(var(--navbar-h) + 16px)', left: 24, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to Browse
          </Link>

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', width: '100%', flexWrap: 'wrap' }}>
            {/* Poster */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              style={{
                width: 'clamp(150px, 30vw, 220px)', flexShrink: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border)',
                background: 'var(--bg-card)', margin: '0 auto',
              }}>
              {cover ? <img src={cover} alt={series.name} style={{ width: '100%', display: 'block' }} /> : <div style={{ height: 330, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ flex: 1, minWidth: 280, paddingBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={series.status} />
                {platform && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                    {platform}
                  </span>
                )}
                {series.premiered && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                    {series.premiered.substring(0,4)}
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
                {series.name}
              </h1>

              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {series.genres?.map((g) => (
                  <span key={g} style={{
                    fontSize: 12, fontWeight: 500, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 'var(--radius-full)'
                  }}>
                    {g}
                  </span>
                ))}
              </div>

              {/* Actions row */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button size="lg" icon={<BookmarkSimple size={20} />} onClick={() => {
                  if (!isAuthenticated) return toast.error('Please log in');
                  setListModalOpen(true);
                }}>
                  {allEntries.length > 0 ? 'Update Seasons' : 'Add to List'}
                </Button>

                {series.rating?.average && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <ScoreRing score={series.rating.average} size={64} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Status indicator if in list */}
        {allEntries.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)',
            border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)',
            padding: '16px 20px', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <CheckCircle size={24} weight="fill" color="#10B981" />
              <p style={{ fontWeight: 600, color: '#10B981', textTransform: 'capitalize' }}>
                Tracking {allEntries.filter(e => e.season_number).length} season{allEntries.filter(e => e.season_number).length !== 1 ? 's' : ''}
              </p>
              <Button variant="ghost" size="sm" style={{ marginLeft: 'auto' }} onClick={() => setListModalOpen(true)}>
                Manage
              </Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 36 }}>
              {allEntries.filter(e => e.season_number).sort((a,b) => a.season_number - b.season_number).map(e => {
                const sData = series?._embedded?.seasons?.find(s => s.id === e.season_id);
                return (
                  <p key={e._id} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Season {e.season_number}</span>
                    {sData?.name && sData.name !== `Season ${e.season_number}` ? ` "${sData.name}"` : ''} 
                    <span style={{ color: 'var(--text-muted)' }}> ({e.status.replace(/_/g, ' ')} - {e.progress}eps)</span>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Main Content */}
          <div style={{ minWidth: 0 }}>
             <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 20 }}>Overview</h2>
             <div 
               style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-base)', overflowWrap: 'break-word' }} 
               dangerouslySetInnerHTML={{ __html: series.summary }} 
             />
          </div>

          {/* Sidebar */}
          <div style={{ minWidth: 0 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Format</p>
                  <p>{series.type}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Language</p>
                  <p>{series.language}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Runtime</p>
                  <p>{series.runtime || series.averageRuntime || '?'} mins</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Episodes</p>
                  <p>{maxEps || '?'}</p>
                </div>
                {series.network?.country?.name && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Country</p>
                    <p>{series.network.country.name}</p>
                  </div>
                )}
                {series.officialSite && (
                  <div>
                    <a href={series.officialSite} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>
                      Official Website ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {listModalOpen && (
        <AddToListModal
          isOpen={listModalOpen}
          onClose={() => setListModalOpen(false)}
          series={series}
          onSave={handleSaveList}
        />
      )}
    </div>
  );
}
