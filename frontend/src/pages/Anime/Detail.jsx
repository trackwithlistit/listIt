import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, BookmarkSimple, Share, PlayCircle, Info,
  Users, FilmSlate, ArrowLeft, CheckCircle, Plus, Minus,
} from '@phosphor-icons/react';
import anilistAPI from '../../services/anilist';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';
import AnimeCard from '../../components/anime/AnimeCard';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';
import { useAuthStore, useListStore } from '../../store';
import { listAPI } from '../../services/backend';
import toast from 'react-hot-toast';
import SafeImage from '../../components/ui/SafeImage';

const TABS = ['Overview', 'Characters', 'Staff', 'Relations', 'Recommendations', 'Reviews'];

function ScoreRing({ score, size = 80 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

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
          {(score / 10).toFixed(1)}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>SCORE</span>
      </div>
    </div>
  );
}

function AddToListModal({ isOpen, onClose, anime, entry, onSave }) {
  const STATUS_OPTIONS = [
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'rewatching', label: 'Rewatching' },
  ];
  const [status, setStatus] = useState(entry?.status || 'plan_to_watch');
  const [score,  setScore]  = useState(entry?.score  || 0);
  const [progress, setProgress] = useState(entry?.progress || 0);
  const [saving, setSaving] = useState(false);

  const currentlyAired = anime?.status === 'RELEASING' && anime?.nextAiringEpisode?.episode 
    ? anime.nextAiringEpisode.episode - 1 
    : 0;
  
  const maxEps = currentlyAired > 0 ? currentlyAired : (anime?.episodes || 0);
  const totalEpsForDisplay = anime?.episodes || '?';

  useEffect(() => {
    if (status === 'completed' && maxEps > 0 && anime?.status !== 'RELEASING') {
      setProgress(maxEps);
    }
  }, [status, maxEps]);

  useEffect(() => {
    if (maxEps > 0) {
      if (progress === maxEps && status !== 'completed' && status !== 'rewatching' && anime?.status !== 'RELEASING') {
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
    let finalStatus = status;
    // Auto-complete if progress reaches max episodes
    if (maxEps > 0 && progress === maxEps && finalStatus !== 'completed' && finalStatus !== 'rewatching' && anime?.status !== 'RELEASING') {
      finalStatus = 'completed';
    } else if (progress > 0 && finalStatus === 'plan_to_watch') {
      finalStatus = 'watching';
    }

    if ((finalStatus === 'completed' || finalStatus === 'rewatching') && anime?.status === 'RELEASING') {
      toast.error('Airing anime cannot be set to completed or rewatching.');
      return;
    }
    setSaving(true);
    await onSave({ status: finalStatus, score, progress });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add to List — ${anime?.title?.english || anime?.title?.romaji}`} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Status */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STATUS_OPTIONS.map((o) => {
              const isDisabled = (o.value === 'completed' || o.value === 'rewatching') && anime?.status === 'RELEASING';
              return (
                <button key={o.value} disabled={isDisabled} onClick={() => setStatus(o.value)}
                  style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                    background: status === o.value ? 'var(--primary-subtle)' : 'var(--bg-card)',
                    border: `1px solid ${status === o.value ? 'var(--primary)' : 'var(--border)'}`,
                    color: isDisabled ? 'var(--text-disabled)' : (status === o.value ? 'var(--primary-light)' : 'var(--text-secondary)'),
                    cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500,
                    transition: 'all 0.15s ease',
                    opacity: isDisabled ? 0.45 : 1,
                  }}>
                  {o.label} {isDisabled && ' (Blocked — Airing)'}
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
            Progress: {progress} {maxEps > 0 ? `/ ${anime?.status === 'RELEASING' ? maxEps : totalEpsForDisplay}` : 'episodes watched'}
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

        <Button onClick={handleSave} loading={saving} fullWidth>
          Save to List
        </Button>
      </div>
    </Modal>
  );
}

export default function AnimeDetail() {
  const { id }   = useParams();
  const { isAuthenticated } = useAuthStore();
  const { getEntryForMedia, addEntry, updateEntry } = useListStore();

  const [anime,    setAnime]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [listModalOpen, setListModalOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const entry = anime ? getEntryForMedia(anime.id) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    anilistAPI.getAnimeDetail(Number(id))
      .then((d) => setAnime(d.Media))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveList = async ({ status, score, progress }) => {
    if (!isAuthenticated) { toast.error('Please log in first'); return; }
    try {
      const payload = { 
        anilist_id: anime.id, 
        title: anime.title?.english || anime.title?.romaji,
        media_type: 'anime', 
        status, 
        score, 
        progress,
        genres: anime.genres || [],
        media_status: anime.status
      };
      if (entry) {
        const { data } = await listAPI.updateEntry(entry._id, payload);
        updateEntry(entry._id, data);
        toast.success('List updated!');
      } else {
        const { data } = await listAPI.addEntry(payload);
        addEntry(data);
        toast.success('Added to list!');
      }
    } catch {
      toast.error('Failed to save. Try again.');
    }
  };

  const formatStatus = (s) => ({
    RELEASING: 'Airing', FINISHED: 'Finished', NOT_YET_RELEASED: 'Upcoming', CANCELLED: 'Cancelled',
  }[s] || s);

  if (loading) return <AnimeDetailSkeleton />;
  if (!anime) return <div style={{ paddingTop: 100, textAlign: 'center', color: 'var(--text-muted)' }}>Anime not found</div>;

  const title = anime.title?.english || anime.title?.romaji;
  const banner = anime.bannerImage || anime.coverImage?.extraLarge;
  const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large;
  const description = anime.description?.replace(/<[^>]*>/g, '') || '';
  const studios = anime.studios?.nodes?.map((s) => s.name).join(', ');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": title,
    "description": description,
    "image": coverImage || '',
    "dateCreated": anime.startDate?.year ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : undefined,
    "aggregateRating": anime.averageScore ? {
      "@type": "AggregateRating",
      "ratingValue": anime.averageScore / 10,
      "bestRating": "10",
      "ratingCount": anime.popularity || 1
    } : undefined
  };

  const isAdultContent = anime.isAdult || anime.genres?.includes('Hentai');

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO 
        title={title} 
        description={description.substring(0, 160) + (description.length > 160 ? '...' : '')} 
        image={coverImage}
        type="video.tv_show"
        canonical={`https://trackwithlistit.vercel.app/anime/${id}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Anime', url: '/anime' },
          { name: title || 'Detail', url: `/anime/${id}` }
        ]}
        structuredData={structuredData}
      />
      {/* ── BANNER ── */}
      <div style={{ position: 'relative', height: 360, overflow: 'hidden', marginBottom: 0 }}>
        {banner && (
          <SafeImage src={banner} alt={title} isAdult={isAdultContent} isBanner={true}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isAdultContent ? 'blur(32px) brightness(0.3)' : 'brightness(0.3)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,8,0.4) 0%, var(--bg-deep) 100%)' }} />
        <div style={{ position: 'absolute', top: 80, left: 0, right: 0 }}>
          <div className="container">
            <Link to="/anime" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Anime
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container" style={{ marginTop: -120, position: 'relative', zIndex: 1, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
          {/* ── POSTER COLUMN ── */}
          <div style={{ flexShrink: 0, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{
                width: '100%', maxWidth: 260, borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                border: '3px solid var(--border)',
                marginBottom: 16, margin: '0 auto 16px', display: 'block',
                height: 360, overflow: 'hidden'
              }}>
                <SafeImage
                  src={coverImage}
                  alt={title}
                  isAdult={isAdultContent}
                />
              </div>

              {/* Quick add button */}
              <Button
                fullWidth size="md"
                icon={entry ? <CheckCircle size={18} weight="fill" /> : <Plus size={18} />}
                variant={entry ? 'accent' : 'primary'}
                onClick={() => isAuthenticated ? setListModalOpen(true) : toast.error('Please log in')}
              >
                {entry ? entry.status.replace(/_/g, ' ') : 'Add to List'}
              </Button>

              {/* Info box */}
              <div style={{ marginTop: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 16 }}>
                {[
                  { label: 'Format',   value: anime.format },
                  { label: 'Episodes', value: anime.status === 'RELEASING' && anime.nextAiringEpisode?.episode ? `${anime.nextAiringEpisode.episode - 1} / ${anime.episodes || '?'}` : (anime.episodes || '?') },
                  { label: 'Duration', value: anime.duration ? `${anime.duration} min` : '24 min' },
                  { label: 'Status',   value: formatStatus(anime.status) },
                  { label: 'Season',   value: `${anime.season || ''} ${anime.seasonYear || ''}`.trim() },
                  { label: 'Studios',  value: studios || 'Production Studio' },
                ].map(({ label, value }) => value && value !== '?' && (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Genres */}
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {anime.genres?.map((g) => (
                  <Link key={g} to={`/anime?genre=${g}`} style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-subtle)', color: 'var(--primary-light)',
                      border: '1px solid rgba(124,58,237,0.2)', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}>
                      {g}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Prequel & Sequel Section */}
              {(() => {
                const prequelEdge = anime.relations?.edges?.find((e) => e.relationType === 'PREQUEL' && e.node?.type === 'ANIME');
                const sequelEdge  = anime.relations?.edges?.find((e) => e.relationType === 'SEQUEL' && e.node?.type === 'ANIME');
                if (!prequelEdge && !sequelEdge) return null;
                return (
                  <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {prequelEdge && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Prequel</p>
                        <Link to={`/anime/${prequelEdge.node.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 10, transition: 'all 0.2s ease', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                        >
                          <img src={prequelEdge.node.coverImage?.large} alt={prequelEdge.node.title?.romaji} style={{ width: 46, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prequelEdge.node.title?.english || prequelEdge.node.title?.romaji}
                            </p>
                            <span style={{ alignSelf: 'flex-start', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                              {prequelEdge.node.format || 'ANIME'}
                            </span>
                          </div>
                        </Link>
                      </div>
                    )}
                    {sequelEdge && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Sequel</p>
                        <Link to={`/anime/${sequelEdge.node.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 10, transition: 'all 0.25s ease', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                        >
                          <img src={sequelEdge.node.coverImage?.large} alt={sequelEdge.node.title?.romaji} style={{ width: 46, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sequelEdge.node.title?.english || sequelEdge.node.title?.romaji}
                            </p>
                            <span style={{ alignSelf: 'flex-start', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                              {sequelEdge.node.format || 'ANIME'}
                            </span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>

          {/* ── DETAIL COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ minWidth: 0 }}
          >
            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4,
              marginTop: 'clamp(10px, 8vw, 120px)',
            }}>
              {title}
            </h1>
            {anime.title?.native && (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
                {anime.title.native}
              </p>
            )}

            {/* Score + stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
              {anime.averageScore && <ScoreRing score={anime.averageScore} size={80} />}
              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { label: 'Popularity', value: anime.popularity?.toLocaleString() },
                  { label: 'Mean Score', value: anime.meanScore ? `${anime.meanScore}%` : null },
                ].filter(v => v.value).map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>{value}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              {anime.trailer?.id && (
                <Button variant="ghost" size="sm" icon={<PlayCircle size={16} />} onClick={() => setTrailerOpen(true)}>
                  Trailer
                </Button>
              )}
              <Button variant="ghost" size="sm" icon={<Share size={16} />}>Share</Button>
              <Button variant="ghost" size="sm" icon={<Heart size={16} />}>Favorite</Button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 28, overflowX: 'auto' }} className="no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 16px',
                    color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab ? 600 : 400,
                    fontSize: 'var(--text-sm)', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {activeTab === 'Overview' && (
                  <div>
                    {anime.description && (
                      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32, fontSize: 'var(--text-sm)' }}
                        dangerouslySetInnerHTML={{ __html: anime.description }} />
                    )}
                    {anime.streamingEpisodes?.length > 0 && (
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>Where to Watch</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {[...new Set(anime.streamingEpisodes.map((e) => e.site))].map((site) => (
                            <span key={site} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid rgba(6,182,212,0.2)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                              {site}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Characters' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {anime.characters?.edges?.map(({ node: char, role, voiceActors }) => (
                      <div key={char.id} style={{ display: 'flex', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 10, alignItems: 'center' }}>
                        <img src={char.image?.large} alt={char.name?.full} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{char.name?.full}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{role}</p>
                          {voiceActors?.[0] && (
                            <p style={{ fontSize: 10, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voiceActors[0].name?.full}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Staff' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {anime.staff?.edges?.map(({ node: staff, role }) => (
                      <div key={`${staff.id}-${role}`} style={{ display: 'flex', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 10, alignItems: 'center' }}>
                        <img src={staff.image?.large} alt={staff.name?.full} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{staff.name?.full}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Relations' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                    {anime.relations?.edges?.map(({ node, relationType }) => (
                      <div key={node.id}>
                        <Link to={node.type === 'ANIME' ? `/anime/${node.id}` : '#'} style={{ textDecoration: 'none', display: 'block' }}>
                          <img src={node.coverImage?.large} alt={node.title?.romaji}
                            style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 8 }} />
                          <p style={{ fontSize: 10, color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{relationType}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{node.title?.english || node.title?.romaji}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Recommendations' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                    {anime.recommendations?.nodes?.map(({ mediaRecommendation: rec }) => rec && (
                      <AnimeCard key={rec.id} anime={rec} size="sm" />
                    ))}
                  </div>
                )}

                {activeTab === 'Reviews' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {anime.reviews?.nodes?.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No reviews yet. Be the first!</p>
                    )}
                    {anime.reviews?.nodes?.map((review) => (
                      <div key={review.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <img src={review.user?.avatar?.large} alt={review.user?.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{review.user?.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Star size={12} weight="fill" color="#F59E0B" />
                              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{review.score}/100</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{review.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Trailer Modal */}
      <Modal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} title="Trailer" size="lg" noPadding>
        {anime.trailer && (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${anime.trailer.id}?autoplay=1`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        anime={anime}
        entry={entry}
        onSave={handleSaveList}
      />

      <Footer />
    </div>
  );
}

function AnimeDetailSkeleton() {
  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <div style={{ height: 360, background: 'var(--bg-elevated)' }} className="skeleton" />
      <div className="container" style={{ marginTop: -120, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, paddingBottom: 80 }}>
        <div>
          <Skeleton height={320} borderRadius="var(--radius-xl)" style={{ marginBottom: 16 }} />
          <Skeleton height={44} borderRadius="var(--radius-md)" />
        </div>
        <div style={{ marginTop: 120 }}>
          <Skeleton height={48} width="70%" style={{ marginBottom: 12 }} />
          <Skeleton height={20} width="40%" style={{ marginBottom: 32 }} />
          <SkeletonText lines={6} />
        </div>
      </div>
    </div>
  );
}
