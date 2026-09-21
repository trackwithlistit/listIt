import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeSlash, BookmarkSimple, ArrowRight, ArrowLeft, User, Envelope, Lock, ShieldCheck, CheckCircle } from '@phosphor-icons/react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/seo/SEO';
import { useAuthStore } from '../../store';
import { authAPI } from '../../services/backend';
import toast from 'react-hot-toast';

const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller'];

const STEPS = ['Email Verification', 'Profile Setup', 'Genres'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(0); // 0: Verification/Account, 1: Profile, 2: Genres
  const [otpStep, setOtpStep] = useState(1); // 1: Enter Email & Pw, 2: Enter OTP
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', confirm: '',
    username: '', bio: '',
    genres: [],
  });

  const [otp, setOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 0 - Sub-step 1: Send OTP
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    const eMap = {};
    if (!form.email || !form.email.includes('@')) eMap.email = 'Valid email is required';
    if (!form.password || form.password.length < 8) eMap.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) eMap.confirm = 'Passwords do not match';

    if (Object.keys(eMap).length > 0) {
      setErrors(eMap);
      return;
    }

    setSendingOtp(true);
    setErrors({});
    try {
      const res = await authAPI.sendOTP(form.email);
      toast.success(res.data.message || 'Verification code sent to your email!');
      setOtpStep(2);
      setCooldown(60); // 60s resend cooldown
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code';
      setErrors({ email: msg });
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setSendingOtp(true);
    setErrors({});
    try {
      const res = await authAPI.sendOTP(form.email);
      toast.success(res.data.message || 'New verification code sent!');
      setCooldown(60);
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification code';
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 0 - Sub-step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP code' });
      return;
    }

    setVerifyingOtp(true);
    setErrors({});
    try {
      await authAPI.verifyOTP({ email: form.email, otp });
      toast.success('Email verified successfully!');
      setIsEmailVerified(true);
      setStep(1); // Proceed to Profile Setup
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code';
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 chars';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const prev = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const toggleGenre = (g) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g],
    }));
  };

  const handleSubmit = async () => {
    const result = await register({
      email: form.email,
      password: form.password,
      username: form.username,
      bio: form.bio,
      favorite_genres: form.genres,
    });
    if (result.success) {
      toast.success('Account created! Welcome to listIt 🎌');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px',
    }}>
      <SEO title="Sign Up" description="Create your listIt account to track anime, web series, characters, and discover new favorites." />
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'var(--primary-glow)', filter: 'blur(100px)', opacity: 0.3, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)', padding: '48px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <Logo size="md" />
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>
          {step === 0 && (otpStep === 1 ? 'Create your listIt account' : 'Verify your email')}
          {step === 1 && 'Set up your profile'}
          {step === 2 && 'Choose your genres'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 28, lineHeight: 1.5 }}>
          {step === 0 && otpStep === 1 && <>Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link></>}
          {step === 0 && otpStep === 2 && <>We've sent a 6-digit verification code to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong></>}
          {step === 1 && 'This helps personalise your experience on listIt'}
          {step === 2 && 'Select all genres that interest you'}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${otpStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 0: Email & OTP Verification */}
            {step === 0 && (
              <div>
                {otpStep === 1 ? (
                  <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Input id="email" name="email" type="email" label="Email" placeholder="you@example.com" icon={<Envelope size={16} />}
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required />
                    <Input id="password" name="password" type={showPw ? 'text' : 'password'} label="Password" placeholder="Min. 8 characters" icon={<Lock size={16} />}
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} required
                      iconRight={<button type="button" onClick={() => setShowPw(!showPw)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>{showPw ? <EyeSlash size={18} /> : <Eye size={18} />}</button>} />
                    <Input id="confirm" name="confirm" type="password" label="Confirm Password" placeholder="Repeat your password" icon={<Lock size={16} />}
                      value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} required />

                    <Button type="submit" loading={sendingOtp} fullWidth size="lg" iconRight={<ArrowRight size={18} />}>
                      Send OTP
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Input
                      id="otp"
                      type="text"
                      label="OTP Code"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      error={errors.otp}
                      required
                      iconRight={<ShieldCheck size={20} color="var(--primary-light)" />}
                    />

                    <div style={{ display: 'flex', gap: 12 }}>
                      <Button type="submit" loading={verifyingOtp} fullWidth size="lg" iconRight={<CheckCircle size={18} />}>
                        Verify OTP
                      </Button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => setOtpStep(1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ArrowLeft size={14} /> Change Email
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={cooldown > 0 || sendingOtp}
                        style={{
                          background: 'none', border: 'none',
                          color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary-light)',
                          fontWeight: 600, cursor: cooldown > 0 ? 'not-allowed' : 'pointer', fontSize: 13
                        }}
                      >
                        {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Didn't receive the code? Resend OTP"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* STEP 1: Profile Setup */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981',
                  borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 10, color: '#10B981', fontSize: 13, fontWeight: 600
                }}>
                  <CheckCircle size={20} weight="fill" />
                  Email verified ({form.email})
                </div>

                <Input id="username" label="Username" placeholder="e.g. animemaster2026" icon={<User size={16} />}
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={errors.username}
                  hint="3–24 characters. Letters, numbers, underscores only." required />
                <div>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Bio (optional)</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 16px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                      outline: 'none', resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Choose Genres */}
            {step === 2 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {GENRES.map((g) => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-full)',
                      cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)',
                      background: form.genres.includes(g) ? 'var(--primary)' : 'var(--bg-card)',
                      border: `1px solid ${form.genres.includes(g) ? 'var(--primary)' : 'var(--border)'}`,
                      color: form.genres.includes(g) ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons for steps 1 and 2 */}
        {step > 0 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <Button variant="ghost" size="lg" icon={<ArrowLeft size={18} />} onClick={prev} style={{ flex: '0 0 auto' }}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="lg" onClick={next} fullWidth iconRight={<ArrowRight size={18} />}>
                Continue
              </Button>
            ) : (
              <Button size="lg" onClick={handleSubmit} loading={isLoading} fullWidth iconRight={<ArrowRight size={18} />}>
                Create Account
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
