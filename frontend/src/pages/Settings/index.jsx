import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, UploadSimple, Check, Image as ImageIcon, X } from '@phosphor-icons/react';
import { useAuthStore } from '../../store';
import { userAPI } from '../../services/backend';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/seo/SEO';
import toast from 'react-hot-toast';

const SETTING_TABS = [
  { key: 'profile',  label: 'Profile Info', icon: User },
  { key: 'security', label: 'Security',     icon: Shield },
];

const AVATAR_TAGS = [
  { key: 'all', label: '#All' },
  { key: 'male', label: '#Male (15)' },
  { key: 'female', label: '#Female (10)' },
  { key: 'OnePiece', label: '#OnePiece' },
  { key: 'JujutsuKaisen', label: '#JujutsuKaisen' },
  { key: 'Naruto', label: '#Naruto' },
  { key: 'AttackOnTitan', label: '#AttackOnTitan' },
  { key: 'ChainsawMan', label: '#ChainsawMan' },
];

// Real high-resolution anime character headshots (AnimeKai Style)
const REAL_ANIME_AVATARS = [
  // ── MALE CHARACTERS (15) ──
  { id: 1, name: 'Luffy', series: 'OnePiece', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png' },
  { id: 2, name: 'Roronoa Zoro', series: 'OnePiece', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png' },
  { id: 3, name: 'Satoru Gojo', series: 'JujutsuKaisen', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png' },
  { id: 4, name: 'Megumi Fushiguro', series: 'JujutsuKaisen', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png' },
  { id: 5, name: 'Yuuji Itadori', series: 'JujutsuKaisen', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b127212-FVm2tD0erQ5B.png' },
  { id: 6, name: 'Naruto Uzumaki', series: 'Naruto', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png' },
  { id: 7, name: 'Itachi Uchiha', series: 'Naruto', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png' },
  { id: 8, name: 'Kakashi Hatake', series: 'Naruto', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png' },
  { id: 9, name: 'Levi', series: 'AttackOnTitan', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png' },
  { id: 10, name: 'Eren Yeager', series: 'AttackOnTitan', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg' },
  { id: 11, name: 'Light Yagami', series: 'DeathNote', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b80-26EhwSsSqQ50.png' },
  { id: 12, name: 'L Lawliet', series: 'DeathNote', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b71-1W4panC53vfs.png' },
  { id: 13, name: 'Tanjiro Kamado', series: 'DemonSlayer', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png' },
  { id: 14, name: 'Ken Kaneki', series: 'TokyoGhoul', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b87275-mb13EWZBdbh3.png' },
  { id: 15, name: 'Denji', series: 'ChainsawMan', gender: 'male', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b130102-FO1VHNnEnLlB.png' },

  // ── FEMALE CHARACTERS (10) ──
  { id: 16, name: 'Mikasa Ackerman', series: 'AttackOnTitan', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png' },
  { id: 17, name: 'Makima', series: 'ChainsawMan', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b137080-UHcynYNjb5ZU.png' },
  { id: 18, name: 'Power', series: 'ChainsawMan', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b137079-6yLEUYR3bmpr.png' },
  { id: 19, name: 'Frieren', series: 'Frieren', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b176754-PCnpqIOkjhFk.png' },
  { id: 20, name: 'Violet Evergarden', series: 'VioletEvergarden', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b90169-4wr1Zehnsac8.png' },
  { id: 21, name: 'Kaguya Shinomiya', series: 'Kaguya', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b120649-NPaWaIpWy60E.png' },
  { id: 22, name: 'Mai Sakurajima', series: 'BunnyGirl', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b127222-Jh5hhP7vZ7s1.png' },
  { id: 23, name: 'Maomao', series: 'Apothecary', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b126824-MqsCncTO1qpv.png' },
  { id: 24, name: 'Emilia', series: 'ReZero', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg' },
  { id: 25, name: 'Kurisu Makise', series: 'SteinsGate', gender: 'female', url: 'https://s4.anilist.co/file/anilistcdn/character/large/b34470-Jw2LXZBL5R8i.png' },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeTag, setActiveTag] = useState('all');
  const [loading, setLoading]     = useState(false);

  const [username, setUsername]   = useState(user?.username || '');
  const [bio,      setBio]        = useState(user?.bio || '');
  const [email,    setEmail]      = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef(null);

  const filteredAvatars = REAL_ANIME_AVATARS.filter((av) => {
    if (activeTag === 'all') return true;
    if (activeTag === 'male') return av.gender === 'male';
    if (activeTag === 'female') return av.gender === 'female';
    return av.series === activeTag;
  });

  const handleSelectPreset = (url) => {
    setAvatarUrl(url);
    toast.success('Avatar selected! Click "Save Changes" to save.');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 100KB = 100 * 1024 bytes
    const MAX_SIZE = 100 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`Image size must be 100KB or smaller. Your file is ${(file.size / 1024).toFixed(1)}KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result;
      setAvatarUrl(base64);
      toast.success('Custom avatar uploaded! Click "Save Changes" to save.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile({
        username,
        bio,
        avatar_url: avatarUrl,
      });
      if (data.user) {
        updateUser(data.user);
      } else {
        updateUser({ username, bio, avatar_url: avatarUrl });
      }
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e?.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await userAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingTop: 'calc(var(--navbar-h) + 40px)' }}>
      <SEO title="Account Settings" noindex={true} />
      <div className="container" style={{ paddingBottom: 80 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 32 }}>
          Settings
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 32, alignItems: 'start' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SETTING_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: activeTab === key ? 'var(--primary-subtle)' : 'transparent',
                  border: 'none', color: activeTab === key ? 'var(--primary-light)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s ease',
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* Pane */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 680 }}>
                
                {/* Profile Picture Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Avatar Collection
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                        Pick a real anime character portrait or upload a custom image (max 100KB).
                      </p>
                    </div>

                    <Avatar src={avatarUrl} name={username} size={70} ring />
                  </div>

                  {/* Custom upload button */}
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<UploadSimple size={16} />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Custom Picture (&le; 100KB)
                    </Button>
                  </div>

                  {/* AnimeKai Style Tag Filter Bar */}
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {AVATAR_TAGS.map((tag) => {
                        const isActive = activeTag === tag.key;
                        return (
                          <button
                            key={tag.key}
                            type="button"
                            onClick={() => setActiveTag(tag.key)}
                            style={{
                              padding: '6px 14px', borderRadius: 'var(--radius-full)',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                              background: isActive ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'var(--bg-card)',
                              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                              boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                            }}
                          >
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Character Avatars Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
                      gap: 16, maxHeight: 360, overflowY: 'auto', paddingRight: 4
                    }} className="no-scrollbar">
                      {filteredAvatars.map((av) => {
                        const isSelected = avatarUrl === av.url;
                        return (
                          <div
                            key={av.id}
                            onClick={() => handleSelectPreset(av.url)}
                            title={`${av.name} (${av.gender})`}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <div style={{
                              width: 64, height: 64, borderRadius: '50%', padding: 2,
                              border: `3px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                              boxShadow: isSelected ? '0 0 16px rgba(124,58,237,0.6)' : 'none',
                              transition: 'all 0.15s ease',
                              position: 'relative', overflow: 'hidden', background: 'var(--bg-card)'
                            }}>
                              <img
                                src={av.url}
                                alt={av.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                              />
                              {isSelected && (
                                <div style={{
                                  position: 'absolute', inset: 0, background: 'rgba(124,58,237,0.4)',
                                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  <Check size={20} weight="bold" color="#fff" />
                                </div>
                              )}
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 600, color: isSelected ? 'var(--primary-light)' : 'var(--text-muted)',
                              marginTop: 6, textAlign: 'center', width: 72, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                              {av.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. animefan2026"
                />
                <Input
                  label="Email"
                  value={email}
                  disabled
                  hint="Email cannot be changed."
                />
                <div>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other fans about yourself..."
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                      outline: 'none', resize: 'vertical',
                    }}
                  />
                </div>

                <Button type="submit" loading={loading} style={{ alignSelf: 'flex-start' }}>
                  Save Changes
                </Button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  hint="At least 8 characters"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button type="submit" loading={passwordLoading} style={{ alignSelf: 'flex-start' }}>
                  Update Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
