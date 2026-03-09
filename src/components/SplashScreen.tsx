import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const Petal = ({ delay, size, left, color, rotation }: { delay: number; size: number; left: number; color: string; rotation: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: size, height: size * 1.6,
      left: `${left}%`,
      top: -size * 2,
      background: color,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      rotate: rotation,
    }}
    animate={{
      y: ['0vh', '115vh'],
      x: [0, Math.sin(delay) * 80, Math.cos(delay) * -60, 0],
      rotate: [rotation, rotation + 360],
      opacity: [0, 1, 1, 0],
    }}
    transition={{ duration: 4 + delay * 0.5, delay: 2.5 + delay * 0.3, ease: 'easeIn' }}
  />
);

const RippleRing = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute rounded-full border-2 inset-0"
    style={{ borderColor: color }}
    initial={{ scale: 0.5, opacity: 0.8 }}
    animate={{ scale: 3.5, opacity: 0 }}
    transition={{ duration: 2.4, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
  />
);

const FloatingDot = ({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full"
    style={{ left: `${x}%`, top: `${y}%`, background: color }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0], y: [0, -30, 0] }}
    transition={{ duration: 2, delay: 1.5 + delay, repeat: Infinity, repeatDelay: 2 }}
  />
);

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800),
      setTimeout(() => onComplete(), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const petals = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    size: 6 + Math.random() * 10,
    left: Math.random() * 100,
    rotation: Math.random() * 360,
    color: [
      'rgba(243,55,145,0.7)', 'rgba(243,55,145,0.5)',
      'rgba(51,105,7,0.6)', 'rgba(255,215,0,0.7)',
      'rgba(255,107,53,0.6)', 'rgba(255,182,215,0.8)',
    ][i % 6],
  }));

  const floatingDots = [
    { x: 15, y: 25, color: '#F33791', delay: 0 },
    { x: 80, y: 20, color: '#336907', delay: 0.3 },
    { x: 10, y: 65, color: '#FFD700', delay: 0.6 },
    { x: 88, y: 60, color: '#FF6B35', delay: 0.2 },
    { x: 50, y: 15, color: '#F33791', delay: 0.8 },
    { x: 25, y: 80, color: '#336907', delay: 0.4 },
    { x: 75, y: 78, color: '#FFD700', delay: 0.9 },
    { x: 60, y: 40, color: '#F33791', delay: 1.1 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 30% 20%, rgba(243,55,145,0.08) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 70% 80%, rgba(51,105,7,0.07) 0%, transparent 60%), #FAFAF8',
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Animated background orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(243,55,145,0.12) 0%, transparent 70%)', top: '-10%', left: '-10%' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(51,105,7,0.10) 0%, transparent 70%)', bottom: '-5%', right: '-5%' }}
          animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

        {/* Floating dots */}
        {phase >= 2 && floatingDots.map((d, i) => <FloatingDot key={i} {...d} />)}

        {/* Petals */}
        {phase >= 3 && petals.map(p => <Petal key={p.id} {...p} />)}

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center px-6">

          {/* Logo */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 w-36 h-36 mx-auto flex items-center justify-center">
              <RippleRing delay={0.8} color="rgba(243,55,145,0.35)" />
              <RippleRing delay={1.4} color="rgba(51,105,7,0.25)" />
              <RippleRing delay={2.0} color="rgba(255,215,0,0.20)" />
            </div>

            <motion.div
              className="absolute w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(243,55,145,0.25) 0%, transparent 70%)', filter: 'blur(20px)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
              className="relative w-32 h-32 rounded-[2rem] bg-white flex items-center justify-center"
              style={{
                boxShadow: '0 0 0 1px rgba(243,55,145,0.15), 0 8px 32px rgba(243,55,145,0.2), 0 24px 64px rgba(0,0,0,0.08)',
              }}
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
            >
              <div className="absolute inset-0 rounded-[2rem] opacity-40"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(243,55,145,0.08) 0%, transparent 60%)' }} />

              <motion.img
                src="/logo.png"
                alt="Les Bulles de Joie"
                className="w-20 h-20 object-contain relative z-10"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.div
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #336907, #4CAF20)' }}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 250 }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            className="text-center mb-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none" style={{ fontFamily: 'Sora, sans-serif' }}>
              <motion.span className="inline-block text-[#1A1A1A]" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>Les </motion.span>
              <motion.span className="inline-block" style={{ color: '#F33791' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>Bulles</motion.span>
              <motion.span className="inline-block text-[#1A1A1A]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}> de </motion.span>
              <motion.span className="inline-block" style={{ color: '#336907' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.35 }}>Joie</motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, rgba(243,55,145,0.4))' }} />
            <p className="text-sm font-medium tracking-[0.18em] uppercase text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Résultats Scolaires Sécurisés</p>
            <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, rgba(51,105,7,0.4))' }} />
          </motion.div>

          {/* Security pill */}
          <motion.div
            className="flex items-center gap-3 px-5 py-3 rounded-full mb-10"
            style={{
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(243,55,145,0.1)',
              backdropFilter: 'blur(12px)',
            }}
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #336907, #4CAF20)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Sora, sans-serif' }}>Connexion 100% Sécurisée</span>
            <motion.div
              className="w-2 h-2 rounded-full bg-[#336907]"
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.div>

          {/* Loading dots */}
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: i < 3 ? '#F33791' : 'rgba(243,55,145,0.25)' }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="text-xs text-[#A3A7A1] font-medium tracking-wide" style={{ fontFamily: 'DM Sans, sans-serif' }}>Préparation de votre espace…</span>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div className="absolute bottom-6 flex flex-col items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.8 }}>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎓</span>
            <span className="text-xs text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Parakou, Bénin</span>
          </div>
          <p className="text-xs text-[#A3A7A1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>© 2017-2025 Les Bulles de Joie</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
