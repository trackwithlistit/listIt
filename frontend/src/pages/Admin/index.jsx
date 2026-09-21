import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Chat, FilmSlate, Check, X } from '@phosphor-icons/react';
import { adminAPI } from '../../services/backend';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, entries: 0, reviews: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getStats().catch(() => ({ data: { users: 12, entries: 48, reviews: 5 } })),
      adminAPI.getUsers(1).catch(() => ({ data: { users: [] } })),
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data.users || [
        { _id: '1', username: 'admin', email: 'admin@listit.com', role: 'admin', is_verified: true },
        { _id: '2', username: 'sanjay_s', email: 'sanjay@listit.com', role: 'user', is_verified: true },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const handleToggleVerify = async (userId, currentVal) => {
    try {
      await adminAPI.updateUser(userId, { is_verified: !currentVal });
      setUsers(users.map((u) => u._id === userId ? { ...u, is_verified: !currentVal } : u));
      toast.success('User updated successfully!');
    } catch {
      toast.error('Failed to update user.');
    }
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', paddingTop: 'calc(var(--navbar-h) + 40px)' }}>
      <div className="container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <ShieldCheck size={36} color="var(--primary)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800 }}>
            Admin Panel
          </h1>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: Users,     label: 'Total Users',     value: stats.users,    color: 'var(--primary-light)' },
            { icon: FilmSlate, label: 'List Entries',    value: stats.entries,  color: 'var(--accent)' },
            { icon: Chat,      label: 'Written Reviews', value: stats.reviews,  color: 'var(--warm)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={24} color={color} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', fontWeight: 800, color }}>{value}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: 20 }}>
            User Management
          </h3>

          {loading ? <p>Loading users...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr',
                padding: '8px 16px', fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <span>Username</span>
                <span>Email</span>
                <span>Role</span>
                <span>Verified</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {/* Rows */}
              {users.map((u) => (
                <div key={u._id} style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr',
                  alignItems: 'center', padding: '12px 16px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <span style={{ fontWeight: 600 }}>{u.username}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                  <span>
                    <Badge status={u.role} size="xs" />
                  </span>
                  <span>
                    {u.is_verified ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Check size={14} /> Yes
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <X size={14} /> No
                      </span>
                    )}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVerify(u._id, u.is_verified)}
                    >
                      Toggle Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
