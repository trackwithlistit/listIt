import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Star, Play, BookmarkSimple, Sparkle } from '@phosphor-icons/react';

const SAMPLE_SHOWS = [
  {
    id: 1,
    title: 'Solo Leveling: Arise',
    type: 'Anime',
    banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    totalEpisodes: 24,
    currentEpisode: 14,
    status: 'Watching',
    rating: 9.4,
    genre: 'Action, Fantasy',
  },
  {
    id: 2,
    title: 'Frieren: Beyond Journey\'s End',
    type: 'Anime',
    banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    totalEpisodes: 28,
    currentEpisode: 28,
    status: 'Completed',
    rating: 9.8,
    genre: 'Adventure, Fantasy',
  },
  {
    id: 3,
    title: 'Stranger Things (Season 5)',
    type: 'Series',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    totalEpisodes: 8,
    currentEpisode: 0,
    status: 'Plan to Watch',
    rating: 9.0,
    genre: 'Sci-Fi, Mystery',
  }
];

export default function InteractiveTrackerPreview() {
  const [shows, setShows] = useState(SAMPLE_SHOWS);
  const [activeTab, setActiveTab] = useState('All');

  const incrementEpisode = (id) => {
    setShows(prev => prev.map(show => {
      if (show.id === id && show.currentEpisode < show.totalEpisodes) {
        const nextEp = show.currentEpisode + 1;
        return {
          ...show,
          currentEpisode: nextEp,
          status: nextEp === show.totalEpisodes ? 'Completed' : 'Watching'
        };
      }
      return show;
    }));
  };

  const filtered = activeTab === 'All' 
    ? shows 
    : shows.filter(s => s.status === activeTab);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-xl)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '250px',
        height: '250px',
        background: 'var(--primary-glow)',
        filter: 'blur(70px)',
        opacity: 0.25,
        pointerEvents: 'none',
      }} />

      {/* Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkle size={18} color="var(--primary-light)" weight="fill" />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Live Tracking Demo (Click +1 Ep to test)
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Watching', 'Completed', 'Plan to Watch'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: activeTab === tab ? 'var(--primary)' : 'var(--bg-elevated)',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab ? 'var(--primary)' : 'var(--border)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Shows List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence>
          {filtered.map((show) => {
            const progress = (show.currentEpisode / show.totalEpisodes) * 100;
            return (
              <motion.div
                key={show.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                {/* Status Dot & Type */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: show.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                  border: `1px solid ${show.status === 'Completed' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(124, 58, 237, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: show.status === 'Completed' ? '#10B981' : 'var(--primary-light)',
                }}>
                  {show.status === 'Completed' ? <Check size={18} weight="bold" /> : <Play size={16} weight="fill" />}
                </div>

                {/* Show Details & Progress */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {show.title}
                    </h4>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-base)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}>
                      {show.genre}
                    </span>
                  </div>

                  {/* Progress Bar & Episodes counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      flex: 1,
                      height: '6px',
                      background: 'var(--bg-base)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: show.status === 'Completed'
                          ? 'linear-gradient(90deg, #10B981, #34D399)'
                          : 'linear-gradient(90deg, var(--primary), var(--accent))',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, minWidth: '60px' }}>
                      {show.currentEpisode} / {show.totalEpisodes} ep
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                    <Star size={14} weight="fill" />
                    <span>{show.rating}</span>
                  </div>
                  <button
                    onClick={() => incrementEpisode(show.id)}
                    disabled={show.currentEpisode >= show.totalEpisodes}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: show.currentEpisode >= show.totalEpisodes ? 'var(--bg-base)' : 'var(--primary-subtle)',
                      color: show.currentEpisode >= show.totalEpisodes ? 'var(--text-muted)' : 'var(--primary-light)',
                      border: `1px solid ${show.currentEpisode >= show.totalEpisodes ? 'var(--border)' : 'var(--primary)'}`,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      cursor: show.currentEpisode >= show.totalEpisodes ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={show.currentEpisode >= show.totalEpisodes ? 'Completed' : 'Add +1 Episode'}
                  >
                    <Plus size={12} weight="bold" />
                    <span>+1 Ep</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
      }}>
        <span>⚡ Real-time updates saved across all devices</span>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Syncs with AniList data</span>
      </div>
    </div>
  );
}
