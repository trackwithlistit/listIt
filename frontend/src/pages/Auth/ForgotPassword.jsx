import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkSimple, ArrowRight, ArrowLeft, Key, CheckCircle, Eye, EyeSlash, ShieldCheck, EnvelopeSimple, LockKey } from '@phosphor-icons/react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/seo/SEO';
import { authAPI } from '../../services/backend';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verify OTP, 3: Set New Password, 4: Success
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1: Submit email to request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid Gmail / Email address' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const res = await authAPI.forgotPassword(email);
      toast.success(res.data.message || 'Verification OTP sent to your email!');
      if (res.data.otp_code) {
        setReceivedOtp(res.data.otp_code);
        setOtp(res.data.otp_code); // Auto-fill for smooth verification experience
      }
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification OTP';
      setErrors({ email: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrors({ otp: 'Please enter the full 6-digit OTP code' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await authAPI.verifyOTP({ email, otp });
      toast.success('OTP verified successfully!');
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification OTP code';
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit new password after OTP verification
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newPassword) errs.newPassword = 'New password is required';
    else if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await authAPI.resetPassword({
        email,
        otp,
        password: newPassword
      });
      toast.success(res.data.message || 'Password changed successfully!');
      setStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-deep)',
    }}>
      <SEO 
        title="Forgot Password" 
        description="Reset your ListIt account password."
        canonical="https://listit.app/forgot-password"
      />
      {/* ── LEFT: Brand panel ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.1) 50%, rgba(6,182,212,0.1) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: 60,
        borderRight: '1px solid var(--border)',
      }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'var(--primary-glow)', filter: 'blur(80px)', opacity: 0.5,
          top: '20%', left: '10%', animation: 'blobDrift 10s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ marginBottom: 48 }}>
            <Logo size="lg" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.2 }}>
            Email OTP<br />
            <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Verification.
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', lineHeight: 1.7, maxWidth: 340 }}>
            Enter your Gmail ID to receive your 6-digit verification OTP and safely reset your password right here on listIt.
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form Flow ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}
        >
          {/* STEP 1: Enter Email / Gmail ID */}
          {step === 1 && (
            <div>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, marginBottom: 24 }}>
                <ArrowLeft size={16} /> Back to Sign In
              </Link>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>
                Forgot Password?
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Enter your Gmail / Email ID to receive a 6-digit OTP verification code.
              </p>

              <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input
                  id="email" type="email" label="Gmail / Email Address" placeholder="yourname@gmail.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  error={errors.email} required
                  iconRight={<EnvelopeSimple size={18} color="var(--text-muted)" />}
                />

                <Button type="submit" loading={loading} fullWidth size="lg" iconRight={<ArrowRight size={18} />}>
                  Send Verification OTP
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: Verify 6-digit OTP code */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
                >
                  <ArrowLeft size={16} /> Change Email
                </button>
                <span style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>Step 1 of 2: OTP Verification</span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>
                Enter Verification OTP
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                A 6-digit OTP code has been generated for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              </p>

              {/* OTP Display Banner */}
              {receivedOtp && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(6,182,212,0.15) 100%)',
                  border: '1px solid var(--primary-light)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Verification OTP Code</p>
                    <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-light)', margin: '2px 0 0 0', letterSpacing: '0.15em' }}>{receivedOtp}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtp(receivedOtp); toast.success('OTP Code Auto-Filled!'); }}
                    style={{
                      background: 'var(--primary)', color: '#fff', border: 'none',
                      padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input
                  id="otp" type="text" label="Enter 6-Digit OTP Code" placeholder="123456"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={errors.otp} required
                  iconRight={<ShieldCheck size={20} color="var(--primary-light)" />}
                />

                <Button type="submit" loading={loading} fullWidth size="lg" iconRight={<ArrowRight size={18} />}>
                  Verify OTP Code
                </Button>
              </form>
            </div>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle size={16} weight="fill" /> OTP Verified
                </span>
                <span style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>Step 2 of 2: New Password</span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>
                Set New Password
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Create a strong password for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              </p>

              {errors.general && (
                <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 6 }}>
                  {errors.general}
                </p>
              )}

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  id="newPassword" type={showPw ? 'text' : 'password'} label="New Password" placeholder="••••••••"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword} required
                  iconRight={
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                      {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />

                <Input
                  id="confirmPassword" type={showPw ? 'text' : 'password'} label="Confirm New Password" placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword} required
                />

                <Button type="submit" loading={loading} fullWidth size="lg" iconRight={<LockKey size={18} />}>
                  Change Password
                </Button>
              </form>
            </div>
          )}

          {/* STEP 4: Password Changed Successfully */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', color: '#10B981'
              }}>
                <CheckCircle size={44} weight="fill" />
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em' }}>
                Password Changed!
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
                Your password for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> has been updated successfully.
              </p>

              <Button onClick={() => navigate('/login')} fullWidth size="lg" iconRight={<ArrowRight size={18} />}>
                Proceed to Sign In
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
