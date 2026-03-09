import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps { onComplete: () => void; }

/* ── Floating confetti petal ── */
const Petal = ({ x, delay, color, size, drift }: { x: number; delay: number; color: string; size: number; drift: number }) => (
  <motion.div
    className="absolute top-0 rounded-full pointer-events-none gpu"
    style={{ left: `${x}%`, width: size, height: size * 1.5, background: color, borderRadius: '50% 50% 40% 60%', willChange: 'transform, opacity' }}
    initial={{ y: -20, opacity: 0, rotate: 0, x: 0 }}
    animate={{ y: '115vh', opacity: [0, 1, 1, 0], rotate: [0, 240, 480], x: [0, drift, -drift * 0.6, drift * 0.3] }}
    transition={{ duration: 5 + delay * 0.4, delay: 2.6 + delay * 0.25, ease: [0.2, 0, 0.8, 1] }}
  />
);

/* ── Expanding ripple ring ── */
const Ripple = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute rounded-full gpu"
    style={{ inset: 0, border: `1.5px solid ${color}`, willChange: 'transform, opacity' }}
    initial={{ scale: 0.6, opacity: 0.6 }}
    animate={{ scale: 3.8, opacity: 0 }}
    transition={{ duration: 2.8, delay, ease: [0.2, 0, 0.8, 1], repeat: Infinity, repeatDelay: 0.8 }}
  />
);

/* ── Orbit dot ── */
const OrbitDot = ({ angle, radius, color, duration }: { angle: number; radius: number; color: string; duration: number }) => {
  const rad = (angle * Math.PI) / 180;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full gpu"
      style={{
        background: color,
        top: '50%', left: '50%',
        marginTop: -4, marginLeft: -4,
        willChange: 'transform',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      style2={{ transformOrigin: `${radius}px 0` }}
    />
  );
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);
  const petalsRef = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 3 + (i * 4.8) % 94,
      delay: i * 0.18,
      drift: 30 + (i % 5) * 15,
      size: 7 + (i % 4) * 3,
      color: ['rgba(243,55,145,0.75)', 'rgba(51,105,7,0.65)', 'rgba(232,160,32,0.80)', 'rgba(255,182,215,0.85)', 'rgba(51,105,7,0.50)'][i % 5],
    }))
  );

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 250),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2600),
      setTimeout(() => onComplete(), 5000),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden hero-gradient"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.015 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Dot grid texture */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb absolute w-[480px] h-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(243,55,145,0.11) 0%, transparent 68%)', top: '-12%', left: '-8%' }} />
          <div className="orb orb-2 absolute w-[380px] h-[380px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(51,105,7,0.09) 0%, transparent 68%)', bottom: '-8%', right: '-8%' }} />
        </div>

        {/* Petals phase 4 */}
        {phase >= 4 && petalsRef.current.map(p => <Petal key={p.id} {...p} />)}

        {/* ── Main logo ── */}
        <div className="relative flex items-center justify-center mb-9" style={{ width: 148, height: 148 }}>
          {/* Ripple rings */}
          {phase >= 2 && (
            <>
              <Ripple delay={0.4} color="rgba(243,55,145,0.3)" />
              <Ripple delay={1.1} color="rgba(51,105,7,0.22)" />
              <Ripple delay={1.8} color="rgba(232,160,32,0.18)" />
            </>
          )}

          {/* Decorative arc ring */}
          {phase >= 2 && (
            <motion.svg
              className="absolute gpu"
              width="148" height="148"
              viewBox="0 0 148 148"
              initial={{ rotate: -120, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ willChange: 'transform' }}
            >
              <circle cx="74" cy="74" r="68" fill="none"
                stroke="url(#arcGrad)" strokeWidth="1.5"
                strokeDasharray="120 310" strokeLinecap="round" />
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F33791" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#336907" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E8A020" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </motion.svg>
          )}

          {/* Logo card */}
          <motion.div
            className="relative z-10 gpu"
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <div
              className="w-28 h-28 rounded-[24px] flex items-center justify-center"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 0 0 1px rgba(243,55,145,0.1), 0 8px 28px rgba(243,55,145,0.22), 0 20px 52px rgba(0,0,0,0.08)',
              }}
            >
              <motion.img
                src="/logo.png"
                alt="Les Bulles de Joie"
                className="w-20 h-20 object-contain"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform' }}
              />
            </div>

            {/* Security badge */}
            <motion.div
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-[10px] flex items-center justify-center gpu"
              style={{ background: 'linear-gradient(135deg, #336907, #4CAF20)', boxShadow: '0 3px 10px rgba(51,105,7,0.45)' }}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.9, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0117.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Title ── */}
        {phase >= 2 && (
          <motion.div
            className="text-center mb-3 px-4"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 9vw, 46px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              <span style={{ color: '#0C0C0B' }}>Les </span>
              <span style={{ color: '#F33791' }}>Bulles</span>
              <span style={{ color: '#0C0C0B' }}> de </span>
              <span style={{ color: '#336907' }}>Joie</span>
            </h1>
          </motion.div>
        )}

        {/* ── Eyebrow / subtitle ── */}
        {phase >= 2 && (
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div style={{ height: 1, width: 32, background: 'linear-gradient(to right, transparent, rgba(243,55,145,0.45))' }} />
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, fontSize: 11, letterSpacing: '0.2em', color: '#7A7A74', textTransform: 'uppercase' }}>
              Résultats Scolaires Sécurisés
            </p>
            <div style={{ height: 1, width: 32, background: 'linear-gradient(to left, transparent, rgba(51,105,7,0.4))' }} />
          </motion.div>
        )}

        {/* ── Security pill ── */}
        {phase >= 3 && (
          <motion.div
            className="flex items-center gap-2.5 px-5 py-3 mb-10"
            style={{
              background: '#FFFFFF',
              borderRadius: 100,
              boxShadow: '0 2px 14px rgba(0,0,0,0.07), 0 0 0 1px rgba(243,55,145,0.09)',
            }}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #336907, #5CB830)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 14, color: '#1A1A18' }}>
              Connexion 100% Sécurisée
            </span>
            <motion.div className="w-2 h-2 rounded-full" style={{ background: '#336907' }}
              animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }} />
          </motion.div>
        )}

        {/* ── Progress bar + status ── */}
        {phase >= 3 && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Thin progress bar */}
            <div style={{ width: 160, height: 3, background: 'rgba(12,12,11,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, #F33791, #336907)', borderRadius: 2, willChange: 'width' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  className="rounded-full"
                  style={{ width: 7, height: 7, background: i < 3 ? '#F33791' : 'rgba(243,55,145,0.2)', willChange: 'transform' }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.14 }}
                />
              ))}
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#7A7A74', marginLeft: 4 }}>
                Préparation…
              </span>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="absolute bottom-6 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 3 }}
        >
          <span style={{ fontSize: 18 }}>🎓</span>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#7A7A74', letterSpacing: '0.05em' }}>
            Parakou, Bénin · © 2017-2026 Les Bulles de Joie
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
