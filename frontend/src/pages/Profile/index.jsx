import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus, UserMinus, Star, FilmSlate, Television,
  Clock, Trophy, Flame, ArrowRight, CheckCircle, ListChecks,
  ChatCircleText, Pulse as ActivityIcon,
} from '@phosphor-icons/react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';
import { userAPI, statsAPI, listAPI } from '../../services/backend';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Anime List', 'Series List', 'Reviews', 'Activity'];

const ANIME_TITLE_MAP = {
  21: 'One Piece',
  135865: 'Bocchi the Rock!',
};

function getAnimeTitle(item) {
  if (item.title && !item.title.startsWith('Anime #')) return item.title;
  if (item.anilist_id && ANIME_TITLE_MAP[item.anilist_id]) return ANIME_TITLE_MAP[item.anilist_id];
  return item.title || `Anime #${item.anilist_id}`;
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [animeLists, setAnimeLists]   = useState({});
  const [seriesLists, setSeriesLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [following, setFollowing] = useState(false);

  const isOwn = me?.username === username;

  useEffect(() => {
    setLoading(true);
    userAPI.getProfile(username)
      .then(({ data }) => {
        setProfile(data);
        setFollowing(data.followers?.includes(me?._id));
        
        return Promise.all([
          statsAPI.getUserStats(data._id).catch(() => ({ data: null })),
          listAPI.getUserLists(data._id).catch(() => ({ data: {} })),
          fetch(`/api/lists/series/${data._id}`).then(res => res.json()).catch(() => ({}))
        ]);
      })
      .then(([statsRes, animeRes, seriesRes]) => {
        if (statsRes?.data) setStats(statsRes.data);
        if (animeRes?.data) setAnimeLists(animeRes.data);
        if (seriesRes) setSeriesLists(seriesRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username, me]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Please log in'); return; }
    try {
      if (following) {
        await userAPI.unfollow(profile._id);
        setFollowing(false);
        toast.success(`Unfollowed ${username}`);
      } else {
        await userAPI.follow(profile._id);
        setFollowing(true);
        toast.success(`Now following ${username}!`);
      }
    } catch { toast.error('Failed'); }
  };

  const totalAnimeCount = Object.values(animeLists).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  const totalSeriesCount = Object.values(seriesLists).reduce((acc, curr) => acc + (curr?.length || 0), 0);

  const mockStats = {
    anime_count: stats?.anime_count || totalAnimeCount || profile?.anime_count || 0,
    episodes:    stats?.total_episodes || profile?.episodes || 0,
    hours:       stats?.total_hours || profile?.hours || 0,
    series:      totalSeriesCount || profile?.series || 0,
    mean_score:  stats?.mean_score || profile?.mean_score || 0,
    streak:      profile?.watch_streak || 0,
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <div style={{ paddingTop: 100, textAlign: 'center', color: 'var(--text-muted)', minHeight: '100vh' }}>
      <p style={{ fontSize: 48 }}>🔍</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginTop: 16 }}>User not found</h2>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <SEO 
        title={profile ? `${profile.username}'s Profile & Watchlist` : 'User Profile'}
        description={profile?.bio || `Explore ${username}'s anime and web series watchlist, ratings, and stats on ListIt.`}
        canonical={`https://listit.app/profile/${username}`}
        image={profile?.avatar_url}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: profile?.username || 'Profile', url: `/profile/${username}` }
        ]}
      />
      {/* Banner */}
      <div style={{
        height: 280,
        background: profile.banner_url
          ? `url(${profile.banner_url}) center/cover`
          : 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(79,70,229,0.3) 50%, rgba(6,182,212,0.3) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg-deep) 100%)' }} />
      </div>

      {/* Profile info */}
      <div className="container" style={{ marginTop: -80, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <Avatar
            src={profile.avatar_url}
            name={profile.username}
            size={120}
            ring
            style={{ border: '4px solid var(--bg-deep)', boxShadow: 'var(--shadow-glow-purple)', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                {profile.username}
              </h1>
              {profile.role === 'admin' && <Badge status="admin" dot />}
              {profile.badges?.includes('early_adopter') && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 700 }}>
                  ⭐ Early Adopter
                </span>
              )}
            </div>
            {profile.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 500, marginBottom: 12 }}>
                {profile.bio}
              </p>
            )}
            <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span><strong style={{ color: 'var(--text-primary)' }}>{profile.following?.length || 0}</strong> Following</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>{profile.followers?.length || 0}</strong> Followers</span>
            </div>
          </div>

          {!isOwn && isAuthenticated && (
            <Button
              variant={following ? 'ghost' : 'primary'}
              size="md"
              icon={following ? <UserMinus size={18} /> : <UserPlus size={18} />}
              onClick={handleFollow}
            >
              {following ? 'Unfollow' : 'Follow'}
            </Button>
          )}
          {isOwn && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/lists">
                <Button variant="primary" size="md" icon={<ListChecks size={18} />}>
                  My Lists
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="md">Edit Profile</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginBottom: 36,
        }}>
          {[
            { icon: FilmSlate,    label: 'Anime',    value: mockStats.anime_count, color: 'var(--primary-light)' },
            { icon: Clock,        label: 'Hours',    value: mockStats.hours,       color: 'var(--accent)' },
            { icon: Star,         label: 'Avg Score',value: mockStats.mean_score ? mockStats.mean_score.toFixed(1) : '—', color: '#F59E0B' },
            { icon: Television,   label: 'Series',   value: mockStats.series,      color: 'var(--secondary-light)' },
            { icon: Flame,        label: 'Streak',   value: `${mockStats.streak}d`, color: 'var(--warm)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '16px',
                textAlign: 'center',
              }}
            >
              <Icon size={20} color={color} style={{ marginBottom: 8 }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'var(--text-xl)', color }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 32, overflowX: 'auto' }} className="no-scrollbar">
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap',
                  color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontWeight: activeTab === tab ? 600 : 400, fontSize: 'var(--text-sm)',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                  transition: 'color 0.2s',
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
              {/* Favorite genres */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 'var(--text-lg)' }}>Favourite Genres</h3>
                {profile.favorite_genres?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.favorite_genres.map((g) => (
                      <span key={g} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'var(--primary-subtle)', color: 'var(--primary-light)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(124,58,237,0.2)' }}>
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No genres set yet</p>
                )}
              </div>

              {/* Achievements */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 'var(--text-lg)' }}>🏆 Achievements</h3>
                {profile.achievements?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.achievements.map((a) => (
                      <span key={a} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontSize: 12, fontWeight: 600, border: '1px solid rgba(245,158,11,0.2)' }}>
                        {a.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No achievements yet. Keep watching!</p>
                )}
              </div>
            </div>

            {/* Quick My List Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.12) 100%)',
              border: '1px solid var(--primary-subtle)', borderRadius: 'var(--radius-xl)',
              padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
            }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 4 }}>
                  Tracked Media Summary
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {totalAnimeCount} Anime entries · {totalSeriesCount} Web Series entries saved in lists
                </p>
              </div>
              <Link to="/lists">
                <Button icon={<ArrowRight size={16} />}>
                  Open My List
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {activeTab === 'Anime List' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)' }}>
                Anime List ({totalAnimeCount})
              </h3>
              <Link to="/lists?type=anime">
                <Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>
                  Manage Anime List
                </Button>
              </Link>
            </div>

            {totalAnimeCount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(animeLists).map(([sec, items]) => items && items.length > 0 && (
                  <div key={sec} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-light)', marginBottom: 12 }}>
                      {sec.replace(/_/g, ' ')} ({items.length})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                      {items.map(item => (
                        <Link key={item._id} to={`/anime/${item.anilist_id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {getAnimeTitle(item)}
                            </span>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              ep {item.progress || 0}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📺</p>
                <p>No anime in list yet.</p>
                <Link to="/anime" style={{ display: 'inline-block', marginTop: 12 }}>
                  <Button size="sm">Browse Anime</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Series List' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)' }}>
                Web Series List ({totalSeriesCount})
              </h3>
              <Link to="/lists?type=series">
                <Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>
                  Manage Web Series List
                </Button>
              </Link>
            </div>

            {totalSeriesCount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(seriesLists).map(([sec, items]) => items && items.length > 0 && (
                  <div key={sec} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#06B6D4', marginBottom: 12 }}>
                      {sec.replace(/_/g, ' ')} ({items.length})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                      {items.map(item => (
                        <Link key={item._id} to={`/series/${item.tvmaze_id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ minWidth: 0, paddingRight: 8 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.title || `Series #${item.tvmaze_id}`}
                              </p>
                              {item.season_number && (
                                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Season {item.season_number}</p>
                              )}
                            </div>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>
                              ep {item.progress || 0}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🎬</p>
                <p>No web series in list yet.</p>
                <Link to="/series" style={{ display: 'inline-block', marginTop: 12 }}>
                  <Button size="sm">Browse Web Series</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
              <ChatCircleText size={48} style={{ marginBottom: 12, opacity: 0.6 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                User Reviews
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', maxWidth: 400, margin: '0 auto 20px' }}>
                Reviews submitted by {username} will be displayed here.
              </p>
              <Link to="/anime">
                <Button variant="ghost" size="sm">Explore Media to Review</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {activeTab === 'Activity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <ActivityIcon size={20} color="var(--primary-light)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                  Recent Activity
                </h3>
              </div>

              {(totalAnimeCount > 0 || totalSeriesCount > 0) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    ...Object.values(animeLists).flat().map(i => ({ ...i, type: 'anime' })),
                    ...Object.values(seriesLists).flat().map(i => ({ ...i, type: 'series' }))
                  ]
                  .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
                  .slice(0, 10)
                  .map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <CheckCircle size={20} color={item.type === 'anime' ? 'var(--primary-light)' : '#06B6D4'} weight="fill" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Updated <Link to={`/${item.type}/${item.anilist_id || item.tvmaze_id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{item.title}</Link>
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Status: <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.status?.replace(/_/g, ' ')}</span> · {item.progress || 0} episodes watched
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: 'var(--text-sm)' }}>
                  Activity timeline will appear here as {username} tracks anime or series.
                </p>
              )}
            </div>
          </motion.div>
        )}

        <div style={{ height: 80 }} />
      </div>
      <Footer />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 280 }} />
      <div className="container" style={{ marginTop: -80 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton height={32} width="200px" style={{ marginBottom: 10 }} />
            <Skeleton height={16} width="300px" style={{ marginBottom: 10 }} />
            <Skeleton height={12} width="120px" />
          </div>
        </div>
      </div>
    </div>
  );
}
