import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeSlash, BookmarkSimple, ArrowRight } from '@phosphor-icons/react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/seo/SEO';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form,    setForm]    = useState({ email: '', password: '', remember: false });
  const [showPw,  setShowPw]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login({ email: form.email, password: form.password });
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-deep)',
    }}>
      <SEO title="Log In" description="Log in to your listIt account to track your anime and web series journey." />
      {/* ── LEFT: Brand panel ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.1) 50%, rgba(6,182,212,0.1) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: 60,
        borderRight: '1px solid var(--border)',
      }}>
        {/* Background blob */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'var(--primary-glow)', filter: 'blur(80px)', opacity: 0.5,
          top: '20%', left: '10%', animation: 'blobDrift 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'var(--accent-glow)', filter: 'blur(100px)', opacity: 0.3,
          bottom: '20%', right: '10%', animation: 'blobDrift 14s ease-in-out infinite reverse',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: 48 }}>
            <Logo size="lg" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.2 }}>
            Track Every<br />
            <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Episode.
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', lineHeight: 1.7, maxWidth: 340 }}>
            Join thousands of anime fans tracking their journey, discovering new favourites, and connecting with the community.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { value: '50K+', label: 'Anime Tracked' },
              { value: '10K+', label: 'Active Users' },
              { value: '200K+', label: 'Episodes Logged' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 'var(--text-sm)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              id="email" name="email" type="email" label="Email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} required
            />
            <Input
              id="password" name="password" type={showPw ? 'text' : 'password'} label="Password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} required
              iconRight={
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                  {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  style={{ accentColor: 'var(--primary)' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={isLoading} fullWidth size="lg" iconRight={<ArrowRight size={18} />}>
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="padding: 60px 80px"] {
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
