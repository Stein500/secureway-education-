import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Captcha } from '../components/Captcha';
import { requestNotificationPermission, notifyLoginSuccess } from '../utils/notifications';
import toast from 'react-hot-toast';

const Orb = ({ size, x, y, color, delay }: { size: number; x: string; y: string; color: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color, willChange: 'transform' }}
    animate={{ scale: [1, 1.15, 1] }}
    transition={{ duration: 16 + delay * 2, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const FloatingBubble = ({ delay, size, x, duration }: { delay: number; size: number; x: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      left: `${x}%`, bottom: -size,
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(243,55,145,0.15))',
      border: '1px solid rgba(243,55,145,0.12)',
    }}
    animate={{ y: [0, -900], x: [0, Math.sin(delay * 2) * 40], opacity: [0, 0.7, 0.5, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
  />
);

const InputIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#C4C8C2' }}>{children}</div>
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
      const t = setTimeout(() => setBlockTimer(blockTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (isBlocked && blockTimer === 0) { setIsBlocked(false); setLoginAttempts(0); }
  }, [blockTimer, isBlocked]);

  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    id: i, delay: i * 1.1,
    size: 12 + Math.random() * 28,
    x: 5 + Math.random() * 90,
    duration: 10 + Math.random() * 8,
  }));

  const validateForm = (): boolean => {
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
    if (isBlocked) { toast.error(`Trop de tentatives. Réessayez dans ${blockTimer}s`); return; }
    if (!validateForm()) return;
    const success = await login(identifier.trim(), password);
    if (success) {
      toast.success('Connexion réussie ! 🎉');
      const hasPerm = await requestNotificationPermission();
      if (hasPerm) notifyLoginSuccess(identifier);
    } else {
      setLoginAttempts(prev => prev + 1);
      toast.error('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#FAFAF8' }}>
      {/* Rich background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Orb size={600} x="-10%" y="-15%" color="rgba(243,55,145,0.09)" delay={0} />
        <Orb size={500} x="60%" y="50%" color="rgba(51,105,7,0.07)" delay={3} />
        <Orb size={400} x="30%" y="60%" color="rgba(255,215,0,0.06)" delay={6} />
        <Orb size={350} x="80%" y="0%" color="rgba(255,107,53,0.05)" delay={2} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(243,55,145,1) 1px, transparent 1px), linear-gradient(90deg, rgba(243,55,145,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {bubbles.map(b => <FloatingBubble key={b.id} {...b} />)}
      </div>

      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-50"
        style={{ background: 'linear-gradient(90deg, #F33791, #FF6B9D, #336907, #FFD700, #F33791)', backgroundSize: '200% 100%' }}
      />

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 0 1px rgba(243,55,145,0.08), 0 8px 32px rgba(0,0,0,0.06), 0 32px 80px rgba(0,0,0,0.06)',
            }}
          >
            {/* Top banner */}
            <div className="relative px-8 pt-8 pb-7 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F33791 0%, #E02A7A 40%, #C01865 100%)' }}
            >
              {/* Star constellation bg */}
              {[...Array(18)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{ left: `${5 + i * 5.5}%`, top: `${10 + (i % 4) * 22}%` }}
                  animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2 + i * 0.3, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
              {/* Curved bottom */}
              <div className="absolute -bottom-1 left-0 right-0">
                <svg viewBox="0 0 400 20" className="w-full" style={{ display: 'block' }}>
                  <path d="M0,0 Q200,20 400,0 L400,20 L0,20 Z" fill="white" />
                </svg>
              </div>

              {/* Logo */}
              <div className="text-center relative z-10">
                <motion.div
                  className="inline-block"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.2 }}
                >
                  <div
                    className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{ background: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  >
                    <img src="/logo.png" alt="Les Bulles de Joie" className="w-14 h-14 object-contain relative z-10"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                    <span className="hidden text-4xl">🎈</span>
                    {/* Shimmer */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                  </div>
                  {/* Green badge */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #336907, #4CAF20)', boxShadow: '0 2px 8px rgba(51,105,7,0.4)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </motion.div>

                <motion.h2
                  className="mt-4 text-xl font-bold text-white"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >Connexion Sécurisée</motion.h2>
                <motion.p
                  className="mt-1 text-sm text-white/70"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >Accédez aux bulletins de votre enfant</motion.p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 pb-7 pt-2 space-y-5">

              {/* Secure badge */}
              <motion.div
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto w-fit"
                style={{ background: 'rgba(51,105,7,0.07)', border: '1px solid rgba(51,105,7,0.12)' }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }}>
                  <svg className="w-3.5 h-3.5 text-[#336907]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <span className="text-xs font-semibold text-[#336907]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Connexion chiffrée et sécurisée</span>
              </motion.div>

              {/* Block warning */}
              <AnimatePresence>
                {isBlocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl"
                    style={{ background: 'rgba(255,107,53,0.07)', border: '1px solid rgba(255,107,53,0.2)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A] text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Trop de tentatives</p>
                        <p className="text-xs text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Réessayez dans <span className="font-bold text-[#FF6B35]">{blockTimer}s</span></p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] tracking-wide uppercase" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}>Identifiant (Matricule)</label>
                <motion.div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    border: `1.5px solid ${focusedField === 'identifier' ? '#F33791' : errors.identifier ? '#F33791' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: focusedField === 'identifier' ? '0 0 0 3px rgba(243,55,145,0.1), 0 4px 16px rgba(243,55,145,0.08)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    background: focusedField === 'identifier' ? 'rgba(243,55,145,0.02)' : 'rgba(0,0,0,0.02)',
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <InputIcon>
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </InputIcon>
                  <input
                    type="text" value={identifier}
                    onChange={e => { setIdentifier(e.target.value.toUpperCase()); if (errors.identifier) setErrors(p => ({ ...p, identifier: undefined })); }}
                    onFocus={() => setFocusedField('identifier')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ex: CE1-001"
                    disabled={isBlocked}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent text-[#1A1A1A] placeholder-[#C4C8C2] focus:outline-none disabled:opacity-50"
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px' }}
                    autoComplete="username"
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.identifier && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-[#F33791] flex items-center gap-1 pl-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.identifier}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] tracking-wide uppercase" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}>Mot de passe</label>
                <motion.div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    border: `1.5px solid ${focusedField === 'password' ? '#F33791' : errors.password ? '#F33791' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(243,55,145,0.1), 0 4px 16px rgba(243,55,145,0.08)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    background: focusedField === 'password' ? 'rgba(243,55,145,0.02)' : 'rgba(0,0,0,0.02)',
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <InputIcon>
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </InputIcon>
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Votre mot de passe"
                    disabled={isBlocked}
                    className="w-full pl-12 pr-12 py-3.5 bg-transparent text-[#1A1A1A] placeholder-[#C4C8C2] focus:outline-none disabled:opacity-50"
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px' }}
                    autoComplete="current-password"
                  />
                  <motion.button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#C4C8C2' }}
                    whileHover={{ scale: 1.1, color: '#F33791' }} whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
                      }
                    </svg>
                  </motion.button>
                </motion.div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-[#F33791] flex items-center gap-1 pl-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Captcha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] tracking-wide uppercase" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}>Vérification de sécurité</label>
                <Captcha onValidate={setCaptchaValid} />
                <AnimatePresence>
                  {errors.captcha && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-[#F33791] flex items-center gap-1 pl-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.captcha}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit" disabled={isLoading || isBlocked}
                className="relative w-full py-4 rounded-2xl text-white font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #F33791 0%, #E02A7A 60%, #C01865 100%)',
                  boxShadow: '0 4px 20px rgba(243,55,145,0.35), 0 8px 32px rgba(243,55,145,0.15)',
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '15px',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(243,55,145,0.45), 0 12px 40px rgba(243,55,145,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <span className="relative flex items-center justify-center gap-2.5">
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connexion en cours…
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se connecter
                    </>
                  )}
                </span>
              </motion.button>

              {/* Help */}
              <motion.div className="text-center pt-1 border-t border-[rgba(0,0,0,0.05)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <p className="text-sm text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Besoin d'aide ?{' '}
                  <a href="tel:+22901979194" className="text-[#F33791] hover:underline font-semibold">Contactez-nous</a>
                </p>
              </motion.div>
            </form>
          </div>

          {/* Bottom trust badge */}
          <motion.div className="mt-5 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#336907]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }} />
                ))}
              </div>
              <span className="text-xs text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Données protégées • Année scolaire 2025-2026</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
