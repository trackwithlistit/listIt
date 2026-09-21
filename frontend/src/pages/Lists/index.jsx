import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash, PencilSimple, Star, Eye,
  SortAscending, SortDescending, Funnel, CaretDown, X as XIcon,
} from '@phosphor-icons/react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Footer from '../../components/layout/Footer';
import { useAuthStore, useListStore, useSeriesListStore } from '../../store';
import { listAPI, seriesListAPI } from '../../services/backend';
import toast from 'react-hot-toast';

const LIST_SECTIONS = [
  { key: 'watching',      label: 'Watching',      color: '#22D3EE' },
  { key: 'completed',     label: 'Completed',      color: '#10B981' },
  { key: 'on_hold',       label: 'On Hold',        color: '#F59E0B' },
  { key: 'dropped',       label: 'Dropped',        color: '#EF4444' },
  { key: 'plan_to_watch', label: 'Plan to Watch',  color: '#8B5CF6' },
  { key: 'rewatching',    label: 'Rewatching',     color: '#06B6D4' },
];

const SORT_FIELDS = [
  { value: 'title',    label: 'Name' },
  { value: 'score',    label: 'Score' },
  { value: 'progress', label: 'Progress' },
  { value: 'updated',  label: 'Date' },
];

const ANIME_TITLE_MAP = {
  21: 'One Piece',
  135865: 'Bocchi the Rock!',
};

export function getAnimeTitle(entry, activeType = 'anime') {
  if (entry.title && !entry.title.startsWith('Anime #') && !entry.title.startsWith('Series #')) return entry.title;
  if (activeType === 'anime' && entry.anilist_id && ANIME_TITLE_MAP[entry.anilist_id]) {
    return ANIME_TITLE_MAP[entry.anilist_id];
  }
  const itemId = entry.tvmaze_id || entry.anilist_id;
  return entry.title || (activeType === 'anime' ? `Anime #${itemId}` : `Series #${itemId}`);
}

// Natural numeric sort — "Season 2" before "Season 12"
const naturalCompare = (a, b) =>
  (a || '').localeCompare(b || '', undefined, { numeric: true, sensitivity: 'base' });

function sortEntries(list, sortField, sortDir, activeType) {
  const sorted = [...list];
  const asc = sortDir === 'asc';
  switch (sortField) {
    case 'title':
      return sorted.sort((a, b) => {
        const titleA = getAnimeTitle(a, activeType);
        const titleB = getAnimeTitle(b, activeType);
        const cmp = naturalCompare(titleA, titleB);
        return asc ? cmp : -cmp;
      });
    case 'score':
      return sorted.sort((a, b) => asc
        ? (a.score || 0) - (b.score || 0)
        : (b.score || 0) - (a.score || 0));
    case 'progress':
      return sorted.sort((a, b) => asc
        ? (a.progress || 0) - (b.progress || 0)
        : (b.progress || 0) - (a.progress || 0));
    case 'updated':
      return sorted.sort((a, b) => asc
        ? new Date(a.updated_at || 0) - new Date(b.updated_at || 0)
        : new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    default: return sorted;
  }
}

function SortBar({ field, dir, onFieldChange, onDirToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = SORT_FIELDS.find(f => f.value === field)?.label || 'Name';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }} ref={ref}>
      {/* Sort field button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', cursor: 'pointer',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
          color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500,
          borderRight: 'none',
        }}
      >
        <SortAscending size={15} />
        {currentLabel}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0 }} />

      {/* Asc / Desc toggle */}
      <button
        onClick={onDirToggle}
        title={dir === 'asc' ? 'Ascending' : 'Descending'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '7px 10px', cursor: 'pointer',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          color: 'var(--text-secondary)', borderLeft: 'none',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        {dir === 'asc'
          ? <SortAscending size={15} />
          : <SortDescending size={15} />}
      </button>

      {/* Field dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.13 }}
            style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 200,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
              minWidth: 130, overflow: 'hidden',
            }}
          >
            {SORT_FIELDS.map(opt => (
              <button key={opt.value}
                onClick={() => { onFieldChange(opt.value); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left',
                  background: field === opt.value ? 'var(--primary-subtle)' : 'transparent',
                  color: field === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)', fontWeight: field === opt.value ? 600 : 400,
                  border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => { if (field !== opt.value) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (field !== opt.value) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GenreDropdown({ allGenres, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (genre) => {
    if (selected.includes(genre)) onChange(selected.filter(g => g !== genre));
    else onChange([...selected, genre]);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 'var(--radius-md)',
          background: selected.length > 0 ? 'var(--primary-subtle)' : 'var(--bg-card)',
          border: `1px solid ${selected.length > 0 ? 'var(--primary)' : 'var(--border)'}`,
          color: selected.length > 0 ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontSize: 'var(--text-sm)', fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <Funnel size={14} />
        Genre {selected.length > 0 ? `(${selected.length})` : ''}
        <CaretDown size={12} style={{ opacity: 0.6 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 200,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
              minWidth: 200, maxHeight: 320, overflowY: 'auto', padding: 8,
            }}
          >
            {allGenres.length === 0 ? (
              <p style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No genres found</p>
            ) : (
              allGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggle(genre)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '8px 10px', textAlign: 'left',
                    background: selected.includes(genre) ? 'var(--primary-subtle)' : 'transparent',
                    color: selected.includes(genre) ? 'var(--primary-light)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)', fontWeight: selected.includes(genre) ? 600 : 400,
                    border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!selected.includes(genre)) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!selected.includes(genre)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${selected.includes(genre) ? 'var(--primary)' : 'var(--border-strong)'}`,
                    background: selected.includes(genre) ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected.includes(genre) && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </span>
                  {genre}
                </button>
              ))
            )}
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                style={{
                  width: '100%', padding: '8px 10px', marginTop: 4,
                  background: 'var(--danger-subtle)', color: 'var(--danger)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListsPage() {
  const { user } = useAuthStore();
  const { userLists, setLists, removeEntry } = useListStore();
  const { seriesLists, setLists: setSeriesLists, removeEntry: removeSeriesEntry } = useSeriesListStore();

  const [params, setParams] = useSearchParams();
  const activeType = params.get('type') || 'anime';
  const activeSection = params.get('status') || 'watching';

  const setActiveType = (type) => {
    const next = new URLSearchParams(params);
    next.set('type', type);
    setParams(next);
  };

  const setActiveSection = (section) => {
    const next = new URLSearchParams(params);
    next.set('status', section);
    setParams(next);
  };

  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('updated');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    if (!user) return;
    const uid = user.id || user._id;
    if (!uid) return;
    setLoading(true);
    const fetchLists = async () => {
      try {
        const [animeRes, seriesRes] = await Promise.all([
          listAPI.getUserLists(uid),
          fetch(`/api/lists/series/${uid}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('listit_token')}` }
          }).then(res => res.json())
        ]);
        setLists(animeRes.data || {});
        setSeriesLists(seriesRes || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [user]);

  // Reset genre filter when switching type or section
  useEffect(() => { setSelectedGenres([]); }, [activeType, activeSection]);

  const handleDelete = async (entry) => {
    if (!confirm('Remove from list?')) return;
    const entryKey = entry._id || entry.id || entry.anilist_id || entry.tvmaze_id;
    try {
      if (entry.media_type === 'series') {
        await seriesListAPI.deleteEntry(entryKey);
        removeSeriesEntry(entryKey);
      } else {
        await listAPI.deleteEntry(entryKey);
        removeEntry(entryKey);
      }
      toast.success('Removed from list');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to remove');
    }
  };

  const currentListsObj = activeType === 'anime' ? userLists : seriesLists;
  const rawList = (currentListsObj[activeSection] || []).filter(e => {
    const mType = e.media_type || (activeType === 'series' ? 'series' : 'anime');
    return activeType === 'anime' ? mType === 'anime' : mType === 'series';
  });
  const linkPrefix = activeType === 'anime' ? '/anime/' : '/series/';
  const idField = activeType === 'anime' ? 'anilist_id' : 'tvmaze_id';

  // Collect all genres from the CURRENT section for filter dropdown
  const allGenres = useMemo(() => {
    const set = new Set();
    rawList.forEach(e => (e.genres || []).forEach(g => set.add(g)));
    return [...set].sort();
  }, [rawList]);

  // Filter then sort
  const currentList = useMemo(() => {
    let list = rawList;
    if (selectedGenres.length > 0) {
      list = list.filter(e => selectedGenres.every(g => (e.genres || []).includes(g)));
    }
    return sortEntries(list, sortField, sortDir);
  }, [rawList, selectedGenres, sortField, sortDir]);

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-deep) 100%)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'calc(var(--navbar-h) + 32px)', paddingBottom: 0,
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>
              My Lists
            </h1>

            {/* Type Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 4 }}>
              {['anime', 'series'].map(t => (
                <button key={t} onClick={() => setActiveType(t)}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    background: activeType === t ? 'var(--bg-elevated)' : 'transparent',
                    color: activeType === t ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: activeType === t ? 600 : 500, fontSize: 'var(--text-sm)',
                    boxShadow: activeType === t ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'anime' ? 'Anime' : 'Web Series'}
                </button>
              ))}
            </div>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }} className="no-scrollbar">
            {LIST_SECTIONS.map(({ key, label, color }) => {
              const count = (currentListsObj[key] || []).length;
              const isActive = activeSection === key;
              return (
                <button key={key} onClick={() => setActiveSection(key)}
                  style={{
                    padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap',
                    color: isActive ? color : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 'var(--text-sm)', background: 'none', border: 'none',
                    borderBottom: `2px solid ${isActive ? color : 'transparent'}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = color; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <span style={{ color: isActive ? color : undefined }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', marginLeft: 4, opacity: 0.8, color: isActive ? color : 'var(--text-muted)' }}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>

        {/* ── Sort & Filter Bar ── */}
        {!loading && rawList.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            justifyContent: 'flex-end', flexWrap: 'wrap',
          }}>
            {selectedGenres.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {selectedGenres.map(g => (
                  <span key={g} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-subtle)', border: '1px solid var(--primary)',
                    color: 'var(--primary-light)', fontSize: 12, fontWeight: 600,
                  }}>
                    {g}
                    <button onClick={() => setSelectedGenres(selectedGenres.filter(x => x !== g))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                      <XIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <SortBar
              field={sortField}
              dir={sortDir}
              onFieldChange={setSortField}
              onDirToggle={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            />
            <GenreDropdown allGenres={allGenres} selected={selectedGenres} onChange={setSelectedGenres} />
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>{selectedGenres.length > 0 ? '🔍' : '📭'}</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {selectedGenres.length > 0 ? 'No matches found' : 'Nothing here yet'}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', marginBottom: 24 }}>
              {selectedGenres.length > 0
                ? 'Try removing some genre filters'
                : `Browse ${activeType === 'anime' ? 'anime' : 'series'} and add them to your list`}
            </p>
            {selectedGenres.length > 0 ? (
              <Button onClick={() => setSelectedGenres([])}>Clear Filters</Button>
            ) : (
              <Link to={activeType === 'anime' ? '/anime' : '/series'}>
                <Button>Browse {activeType === 'anime' ? 'Anime' : 'Series'}</Button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px',
              padding: '8px 16px', fontSize: 11,
              color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <span>Title</span>
              <span style={{ textAlign: 'center' }}>Score</span>
              <span style={{ textAlign: 'center' }}>Progress</span>
              <span style={{ textAlign: 'center' }}>Type</span>
              <span style={{ textAlign: 'center' }}>Actions</span>
            </div>

            <AnimatePresence mode="popLayout">
              {currentList.map((entry, i) => {
                const targetMediaId = activeType === 'anime' ? entry.anilist_id : (entry.tvmaze_id || entry.anilist_id);
                return (
                  <motion.div
                    key={entry.id || entry._id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{ minWidth: 0 }}>
                        <Link to={`${linkPrefix}${targetMediaId}`}
                          style={{ textDecoration: 'none', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          {getAnimeTitle(entry, activeType)}
                        </Link>
                        {(entry.genres || []).length > 0 && (
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.genres.slice(0, 3).join(' · ')}
                          </p>
                        )}
                      </div>
                      {entry.is_favorite && <Star size={14} weight="fill" color="#F59E0B" style={{ flexShrink: 0 }} />}
                      {entry.is_private && <Eye size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: entry.score ? '#F59E0B' : 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                      {entry.score || '—'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {entry.progress || 0}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Badge status={entry.media_type || activeType} size="xs" />
                    </div>
                    <div style={{ textAlign: 'center', display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <Link to={`${linkPrefix}${targetMediaId}`}>
                        <button style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PencilSimple size={14} />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(entry)}
                        style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
