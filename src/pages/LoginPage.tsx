import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Captcha } from '../components/Captcha';
import { requestNotificationPermission, notifyLoginSuccess } from '../utils/notifications';
import toast from 'react-hot-toast';

/* Smooth rising bubble */
const safeWindowHeight = () =>
  typeof window !== 'undefined' ? window.innerHeight : 800;

const Bubble = ({ x, size, delay, dur }: { x: number; size: number; delay: number; dur: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none gpu"
    style={{
      left: `${x}%`, bottom: -size,
      width: size, height: size,
      background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.88), rgba(243,55,145,0.12))',
      border: '1px solid rgba(243,55,145,0.1)',
      willChange: 'transform, opacity',
    }}
    animate={{ y: [0, -(safeWindowHeight() + size * 2)], opacity: [0, 0.6, 0.5, 0] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
  />
);

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; captcha?: string }>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (loginAttempts >= 5) { setIsBlocked(true); setBlockTimer(30); }
  }, [loginAttempts]);

  useEffect(() => {
    if (blockTimer > 0) {
      const t = setTimeout(() => setBlockTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    } else if (isBlocked && blockTimer === 0) { setIsBlocked(false); setLoginAttempts(0); }
  }, [blockTimer, isBlocked]);

  const bubbles = [
    { x: 5,  size: 14, delay: 0,   dur: 12 },
    { x: 18, size: 22, delay: 2,   dur: 16 },
    { x: 32, size: 10, delay: 4,   dur: 11 },
    { x: 52, size: 18, delay: 1,   dur: 14 },
    { x: 68, size: 26, delay: 6,   dur: 18 },
    { x: 80, size: 12, delay: 3,   dur: 13 },
    { x: 90, size: 20, delay: 8,   dur: 15 },
    { x: 42, size: 16, delay: 5.5, dur: 17 },
  ];

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = 'Veuillez entrer votre identifiant';
    else if (identifier.length < 3) e.identifier = 'Identifiant trop court';
    if (!password) e.password = 'Veuillez entrer votre mot de passe';
    else if (password.length < 3) e.password = 'Mot de passe trop court';
    if (!captchaValid) e.captcha = 'Veuillez résoudre le captcha';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) { toast.error(`Réessayez dans ${blockTimer}s`); return; }
    if (!validate()) return;
    const ok = await login(identifier.trim(), password);
    if (ok) {
      toast.success('Connexion réussie ! 🎉');
      const p = await requestNotificationPermission();
      if (p) notifyLoginSuccess(identifier);
    } else {
      setLoginAttempts(v => v + 1);
      toast.error('Identifiants incorrects');
    }
  };

  const inputBorder = (field: string) =>
    focusedField === field
      ? { border: '1.5px solid #F33791', boxShadow: '0 0 0 3.5px rgba(243,55,145,0.1), 0 4px 12px rgba(243,55,145,0.06)', background: 'rgba(243,55,145,0.018)' }
      : errors[field as keyof typeof errors]
      ? { border: '1.5px solid #F33791', background: 'rgba(243,55,145,0.02)' }
      : { border: '1.5px solid rgba(12,12,11,0.1)', background: 'rgba(12,12,11,0.025)' };

  return (
    <div className="min-h-screen flex flex-col hero-gradient relative overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb absolute rounded-full" style={{ width: 520, height: 520, top: '-15%', left: '-12%', background: 'radial-gradient(circle, rgba(243,55,145,0.08) 0%, transparent 68%)' }} />
        <div className="orb orb-2 absolute rounded-full" style={{ width: 420, height: 420, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(51,105,7,0.07) 0%, transparent 68%)' }} />
      </div>

      {/* Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map((b, i) => <Bubble key={i} {...b} />)}
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ── Login Card ── */}
          <div className="card-premium relative"
            style={{ boxShadow: '0 0 0 1px rgba(243,55,145,0.07), 0 12px 40px rgba(0,0,0,0.08), 0 32px 80px rgba(0,0,0,0.05)' }}>

            {/* ── Hero banner ── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F33791 0%, #D41E6F 55%, #A80D52 100%)', padding: '36px 32px 48px' }}>
              {/* Constellation dots */}
              {Array.from({ length: 22 }).map((_, i) => (
                <motion.div key={i}
                  className="absolute rounded-full"
                  style={{
                    width: i % 3 === 0 ? 3 : 1.5,
                    height: i % 3 === 0 ? 3 : 1.5,
                    background: 'rgba(255,255,255,0.6)',
                    left: `${4 + i * 4.4}%`,
                    top: `${15 + (i % 5) * 17}%`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 2 + i * 0.28, delay: i * 0.18, repeat: Infinity }}
                />
              ))}

              {/* Diagonal light sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)' }}
                animate={{ x: ['-80%', '160%'] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              />

              {/* Wave bottom */}
              <div className="absolute -bottom-px left-0 right-0 pointer-events-none">
                <svg viewBox="0 0 400 24" style={{ display: 'block', width: '100%', height: 24 }}>
                  <path d="M0,4 Q100,20 200,8 Q300,-4 400,12 L400,24 L0,24 Z" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Logo */}
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  className="relative mb-4"
                  initial={{ scale: 0.6, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                >
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-[20px]"
                    style={{ boxShadow: '0 0 0 8px rgba(255,255,255,0.1), 0 0 0 16px rgba(255,255,255,0.05)', borderRadius: 24 }} />
                  <div className="w-[84px] h-[84px] rounded-[22px] flex items-center justify-center overflow-hidden relative"
                    style={{ background: '#FFFFFF', boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }}>
                    <img src="/logo.png" alt="Les Bulles de Joie" className="w-[62px] h-[62px] object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    {/* Inner shimmer */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                    />
                  </div>
                  {/* Security badge */}
                  <motion.div
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-[9px] flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #336907, #5CB830)', boxShadow: '0 3px 10px rgba(51,105,7,0.5)' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.85, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </motion.div>

                <motion.h2
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 22, color: '#FFFFFF', letterSpacing: '-0.02em' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                >Connexion Sécurisée</motion.h2>
                <motion.p
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 4 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                >Accédez aux bulletins de votre enfant</motion.p>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ padding: '8px 28px 28px' }}>

              {/* Secure badge */}
              <motion.div
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto mb-5 w-fit"
                style={{ background: 'rgba(51,105,7,0.07)', border: '1px solid rgba(51,105,7,0.12)' }}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              >
                <svg className="w-3.5 h-3.5" style={{ color: '#336907' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0117.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 12, color: '#336907' }}>
                  Connexion chiffrée et sécurisée
                </span>
              </motion.div>

              {/* Block warning */}
              <AnimatePresence>
                {isBlocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(224,107,32,0.07)', border: '1px solid rgba(224,107,32,0.2)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#E06B20' }}>
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 13, color: '#0C0C0B' }}>Trop de tentatives</p>
                        <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#7A7A74' }}>
                          Réessayez dans <strong style={{ color: '#E06B20' }}>{blockTimer}s</strong>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Identifier */}
              <div className="mb-4">
                <label style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 11, color: '#0C0C0B', letterSpacing: '0.09em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Identifiant (Matricule)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#A0A09A' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text" value={identifier}
                    onChange={e => { setIdentifier(e.target.value.toUpperCase()); setErrors(p => ({ ...p, identifier: undefined })); }}
                    onFocus={() => setFocusedField('identifier')} onBlur={() => setFocusedField(null)}
                    placeholder="Entrez votre identifiant"
                    disabled={isBlocked}
                    className="input-field"
                    style={{ ...inputBorder('identifier'), transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s' }}
                    autoComplete="username"
                  />
                </div>
                <AnimatePresence>
                  {errors.identifier && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 mt-1.5 pl-1"
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#F33791' }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.identifier}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 11, color: '#0C0C0B', letterSpacing: '0.09em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#A0A09A' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    placeholder="Votre mot de passe"
                    disabled={isBlocked}
                    className="input-field"
                    style={{ ...inputBorder('password'), paddingRight: 44, transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s' }}
                    autoComplete="current-password"
                  />
                  <motion.button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-base"
                    style={{ color: '#A0A09A' }}
                    whileHover={{ scale: 1.12, color: '#F33791' }} whileTap={{ scale: 0.9 }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
                      }
                    </svg>
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 mt-1.5 pl-1"
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#F33791' }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Captcha */}
              <div className="mb-6">
                <label style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 11, color: '#0C0C0B', letterSpacing: '0.09em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Vérification de sécurité
                </label>
                <Captcha onValidate={setCaptchaValid} />
                <AnimatePresence>
                  {errors.captcha && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 mt-1.5 pl-1"
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#F33791' }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.captcha}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Blocked state banner */}
              <AnimatePresence>
                {isBlocked && (
                  <motion.div
                    className="mb-5 rounded-[16px] overflow-hidden"
                    style={{ background: 'rgba(232,160,32,0.07)', border: '1px solid rgba(232,160,32,0.25)' }}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <motion.span style={{ fontSize: 16 }}
                          animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}>
                          🔒
                        </motion.span>
                        <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 13, color: '#8B5E00' }}>
                          Trop de tentatives — réessayez dans{' '}
                          <span style={{ color: '#E06B20', fontSize: 15 }}>{blockTimer}s</span>
                        </p>
                      </div>
                      {/* Progress bar draining */}
                      <div style={{ height: 4, background: 'rgba(232,160,32,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', background: 'linear-gradient(90deg, #E8A020, #E06B20)', borderRadius: 2, willChange: 'width' }}
                          initial={{ width: '100%' }}
                          animate={{ width: `${(blockTimer / 30) * 100}%` }}
                          transition={{ duration: 0.9, ease: 'linear' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit" disabled={isLoading || isBlocked}
                className="btn-rose w-full disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isLoading && !isBlocked ? { translateY: -2 } : {}}
                whileTap={!isLoading && !isBlocked ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4.5 h-4.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </>
                )}
              </motion.button>

              {/* Help */}
              <p className="text-center mt-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#7A7A74' }}>
                Besoin d'aide ?{' '}
                <a href="tel:+22901979194" style={{ color: '#F33791', fontWeight: 600 }}
                  className="hover:underline">Contactez-nous</a>
              </p>
            </form>
          </div>

          {/* Trust strip */}
          <motion.div className="mt-5 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#336907' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity }} />
              ))}
            </div>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#7A7A74' }}>
              Données protégées · Année 2025-2026
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
