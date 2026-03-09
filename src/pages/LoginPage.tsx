import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Captcha } from '../components/Captcha';
import { requestNotificationPermission, notifyLoginSuccess } from '../utils/notifications';
import toast from 'react-hot-toast';

const FloatingBubble = ({ delay, size, x, duration }: { delay: number; size: number; x: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none gpu-accelerated"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: -size,
      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(243,55,145,0.2))`,
    }}
    animate={{ y: [0, -1000], x: [0, Math.sin(delay * 2) * 30], scale: [1, 1.1, 0.9, 1] }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  />
);

const AnimatedIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
    className="gpu-accelerated"
  >
    {children}
  </motion.div>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {visible ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
    )}
  </svg>
);

const FireParticle = ({ x, delay }: { x: number; delay: number }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full gpu-accelerated"
    style={{ left: `${x}%`, bottom: 0, background: 'linear-gradient(to top, #FF6B35, #F7C948)' }}
    animate={{ y: [0, -60, -100], opacity: [0, 1, 0], scale: [0.5, 1, 0] }}
    transition={{ duration: 1.5, delay, repeat: Infinity, ease: "easeOut" }}
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
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      setBlockTimer(30);
    }
  }, [loginAttempts]);

  useEffect(() => {
    if (blockTimer > 0) {
      const timer = setTimeout(() => setBlockTimer(blockTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimer === 0) {
      setIsBlocked(false);
      setLoginAttempts(0);
    }
  }, [blockTimer, isBlocked]);

  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.8,
    size: 15 + Math.random() * 35,
    x: 5 + Math.random() * 90,
    duration: 8 + Math.random() * 6,
  }));

  const fireParticles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 20 + i * 8,
    delay: i * 0.1,
  }));

  const validateForm = (): boolean => {
    const newErrors: { identifier?: string; password?: string; captcha?: string } = {};
    if (!identifier.trim()) newErrors.identifier = 'Veuillez entrer votre identifiant';
    else if (identifier.length < 3) newErrors.identifier = 'Identifiant trop court';
    if (!password) newErrors.password = 'Veuillez entrer votre mot de passe';
    else if (password.length < 3) newErrors.password = 'Mot de passe trop court';
    if (!captchaValid) newErrors.captcha = 'Veuillez résoudre le captcha';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      toast.error(`Trop de tentatives. Réessayez dans ${blockTimer}s`);
      return;
    }
    if (!validateForm()) return;
    
    const success = await login(identifier.trim(), password);
    if (success) {
      toast.success('Connexion réussie !');
      
      // Demander permission notification et envoyer une notification
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        notifyLoginSuccess(identifier);
      }
    } else {
      setLoginAttempts(prev => prev + 1);
      toast.error('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFEFE] relative overflow-hidden">
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map(bubble => <FloatingBubble key={bubble.id} {...bubble} />)}
      </div>
      
      {/* Wave background */}
      <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 200">
          <motion.path 
            d="M0,100 C360,150 720,50 1080,100 C1260,125 1380,75 1440,100 L1440,200 L0,200 Z" 
            fill="rgba(243,55,145,0.05)" 
            animate={{ 
              d: [
                "M0,100 C360,150 720,50 1080,100 C1260,125 1380,75 1440,100 L1440,200 L0,200 Z",
                "M0,120 C360,70 720,130 1080,80 C1260,95 1380,105 1440,90 L1440,200 L0,200 Z"
              ] 
            }} 
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }} 
          />
        </svg>
      </div>
      
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} 
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-[#ECEBEC] overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#F33791] to-[#FF6B9D] px-8 py-8 text-center overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="absolute w-1 h-1 bg-white/30 rounded-full" 
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} 
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }} 
                    transition={{ duration: 2, delay: Math.random() * 2, repeat: Infinity }} 
                  />
                ))}
              </div>
              
              <motion.div className="relative inline-block" whileHover={{ scale: 1.05 }}>
                <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Les Bulles de Joie" 
                    className="w-16 h-16 object-contain" 
                    onError={(e) => { 
                      (e.target as HTMLImageElement).style.display = 'none'; 
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); 
                    }} 
                  />
                  <span className="hidden text-4xl">🎈</span>
                </div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#336907] rounded-lg flex items-center justify-center shadow-md" 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </motion.div>
              
              <motion.h1 
                className="mt-4 text-2xl font-bold text-white" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
              >
                Connexion Sécurisée
              </motion.h1>
              <motion.p 
                className="mt-1 text-white/80 text-sm" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.3 }}
              >
                Accédez aux résultats scolaires
              </motion.p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Security badge */}
              <motion.div 
                className="flex items-center justify-center gap-2 py-2 px-4 bg-[#336907]/10 rounded-full" 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
              >
                <AnimatedIcon delay={0}>
                  <svg className="w-4 h-4 text-[#336907]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </AnimatedIcon>
                <span className="text-xs font-medium text-[#336907]">Connexion chiffrée et sécurisée</span>
              </motion.div>
              
              {/* Block warning */}
              <AnimatePresence>
                {isBlocked && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">Trop de tentatives</p>
                        <p className="text-sm text-[#A3A7A1]">
                          Réessayez dans <span className="font-bold text-[#FF6B35]">{blockTimer}s</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Identifier field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A1A1A]">Identifiant (Matricule)</label>
                <motion.div 
                  className={`relative rounded-xl border-2 transition-smooth ${
                    focusedField === 'identifier' 
                      ? 'border-[#F33791] shadow-lg shadow-[#F33791]/10' 
                      : errors.identifier 
                        ? 'border-[#F33791]' 
                        : 'border-[#ECEBEC]'
                  }`} 
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A7A1]">
                    <AnimatedIcon delay={0}><UserIcon /></AnimatedIcon>
                  </div>
                  <input 
                    type="text" 
                    value={identifier} 
                    onChange={(e) => { 
                      setIdentifier(e.target.value.toUpperCase()); 
                      if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined })); 
                    }} 
                    onFocus={() => setFocusedField('identifier')} 
                    onBlur={() => setFocusedField(null)} 
                    placeholder="Entrez votre matricule" 
                    disabled={isBlocked} 
                    className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-[#1A1A1A] placeholder-[#A3A7A1] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                    autoComplete="username"
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.identifier && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -5 }} 
                      className="text-sm text-[#F33791] flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.identifier}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Password field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A1A1A]">Mot de passe</label>
                <motion.div 
                  className={`relative rounded-xl border-2 transition-smooth ${
                    focusedField === 'password' 
                      ? 'border-[#F33791] shadow-lg shadow-[#F33791]/10' 
                      : errors.password 
                        ? 'border-[#F33791]' 
                        : 'border-[#ECEBEC]'
                  }`} 
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A7A1]">
                    <AnimatedIcon delay={0.2}><LockIcon /></AnimatedIcon>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); 
                    }} 
                    onFocus={() => setFocusedField('password')} 
                    onBlur={() => setFocusedField(null)} 
                    placeholder="Entrez votre mot de passe" 
                    disabled={isBlocked} 
                    className="w-full pl-12 pr-12 py-4 bg-transparent rounded-xl text-[#1A1A1A] placeholder-[#A3A7A1] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                    autoComplete="current-password"
                  />
                  <motion.button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A7A1] hover:text-[#F33791] transition-colors" 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <EyeIcon visible={showPassword} />
                  </motion.button>
                </motion.div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -5 }} 
                      className="text-sm text-[#F33791] flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Captcha */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A1A1A]">Vérification de sécurité</label>
                <Captcha onValidate={setCaptchaValid} />
                <AnimatePresence>
                  {errors.captcha && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -5 }} 
                      className="text-sm text-[#F33791] flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.captcha}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Submit button */}
              <motion.button 
                type="submit" 
                disabled={isLoading || isBlocked} 
                className="relative w-full py-4 bg-[#F33791] hover:bg-[#E02A7A] text-white font-semibold rounded-xl transition-smooth disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group" 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                  initial={{ x: '-100%' }} 
                  whileHover={{ x: '100%' }} 
                  transition={{ duration: 0.6 }} 
                />
                <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                  {fireParticles.map(p => <FireParticle key={p.id} {...p} />)}
                </div>
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <AnimatedIcon delay={0.4}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </AnimatedIcon>
                      Se connecter
                    </>
                  )}
                </span>
              </motion.button>
              
              {/* Help link */}
              <motion.div 
                className="text-center pt-4 border-t border-[#ECEBEC]" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-[#A3A7A1]">
                  Besoin d'aide ? 
                  <a href="tel:+22901979194" className="ml-1 text-[#F33791] hover:underline font-medium">
                    Contactez-nous
                  </a>
                </p>
              </motion.div>
            </form>
          </div>
          
          {/* Footer badge */}
          <motion.div 
            className="mt-6 text-center" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-[#ECEBEC]">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i} 
                    className="w-2 h-2 bg-[#336907] rounded-full" 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }} 
                  />
                ))}
              </div>
              <span className="text-xs text-[#A3A7A1]">Données protégées • Année scolaire 2025-2026</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
