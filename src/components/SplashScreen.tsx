import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const FloatingBubble = ({ delay, size, left, duration }: { delay: number; size: number; left: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full z-20"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      bottom: -size,
      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(243,55,145,0.4))`,
      boxShadow: '0 0 20px rgba(243,55,145,0.3), inset 0 0 20px rgba(255,255,255,0.5)',
    }}
    initial={{ y: 0, opacity: 0, scale: 0 }}
    animate={{ 
      y: [-size, -900], 
      opacity: [0, 1, 1, 0], 
      scale: [0, 1, 1.1, 0.8], 
      x: [0, Math.sin(delay) * 60, Math.cos(delay) * -40, 0] 
    }}
    transition={{ duration: duration * 1.5, delay: delay * 0.8, ease: "easeOut" }}
  />
);

const FireParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full z-20"
    style={{ 
      left: `calc(50% + ${x}px)`, 
      bottom: '30%', 
      background: 'linear-gradient(to top, #FF6B35, #F7C948, #FDFEFE)' 
    }}
    initial={{ y: 0, opacity: 0, scale: 0 }}
    animate={{ y: [-20, -120], opacity: [0, 1, 0], scale: [0, 1.5, 0], x: [0, x * 0.5] }}
    transition={{ duration: 1, delay: 2.5 + delay, ease: "easeOut" }}
  />
);

const Sparkle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div 
    className="absolute z-20" 
    style={{ left: `${x}%`, top: `${y}%` }} 
    initial={{ opacity: 0, scale: 0, rotate: 0 }} 
    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], rotate: [0, 180] }} 
    transition={{ duration: 0.8, delay: 3 + delay, ease: "easeOut" }}
  >
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z" fill="#F7C948"/>
    </svg>
  </motion.div>
);

const LaughEmoji = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div 
    className="absolute text-4xl z-20" 
    style={{ left: `${x}%`, top: `${y}%` }} 
    initial={{ opacity: 0, scale: 0, rotate: -20 }} 
    animate={{ 
      opacity: [0, 1, 1, 0], 
      scale: [0, 1.3, 1.1, 0.8], 
      rotate: [-20, 10, -10, 20], 
      y: [0, -30, -20, -60] 
    }} 
    transition={{ duration: 1.8, delay: 1 + delay, ease: "easeOut" }}
  >
    😊
  </motion.div>
);

// Composant pour l'effet de vague qui monte comme l'eau qui remplit un vase
const RisingWater = () => {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 overflow-hidden z-10"
      initial={{ height: '0%' }}
      animate={{ height: '100%' }}
      transition={{ 
        duration: 4.5, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {/* Gradient d'eau principal */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(243,55,145,0.35) 0%, rgba(243,55,145,0.25) 30%, rgba(51,105,7,0.15) 60%, rgba(255,215,0,0.1) 80%, transparent 100%)'
        }}
      />
      
      {/* Vague animée 1 - Rose */}
      <motion.div
        className="absolute top-0 left-0 w-[300%] h-16"
        animate={{ x: [0, '-33.33%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 1800 60" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,30 C150,60 300,0 450,30 C600,60 750,0 900,30 C1050,60 1200,0 1350,30 C1500,60 1650,0 1800,30 L1800,60 L0,60 Z"
            fill="rgba(243,55,145,0.5)"
          />
        </svg>
      </motion.div>
      
      {/* Vague animée 2 - Verte */}
      <motion.div
        className="absolute top-3 left-0 w-[300%] h-14"
        initial={{ x: '-16.66%' }}
        animate={{ x: ['-16.66%', '-50%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 1800 50" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,25 C100,50 200,0 300,25 C400,50 500,0 600,25 C700,50 800,0 900,25 C1000,50 1100,0 1200,25 C1300,50 1400,0 1500,25 C1600,50 1700,0 1800,25 L1800,50 L0,50 Z"
            fill="rgba(51,105,7,0.4)"
          />
        </svg>
      </motion.div>
      
      {/* Vague animée 3 - Dorée */}
      <motion.div
        className="absolute top-6 left-0 w-[300%] h-12"
        initial={{ x: '-10%' }}
        animate={{ x: ['-10%', '-43.33%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 1800 40" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,20 C75,40 150,0 225,20 C300,40 375,0 450,20 C525,40 600,0 675,20 C750,40 825,0 900,20 C975,40 1050,0 1125,20 C1200,40 1275,0 1350,20 C1425,40 1500,0 1575,20 C1650,40 1725,0 1800,20 L1800,40 L0,40 Z"
            fill="rgba(255,215,0,0.35)"
          />
        </svg>
      </motion.div>
      
      {/* Petites bulles qui montent dans l'eau */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6 + Math.random() * 10,
            height: 6 + Math.random() * 10,
            left: `${5 + i * 8}%`,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
            boxShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}
          initial={{ bottom: '5%', opacity: 0 }}
          animate={{ 
            bottom: ['5%', '95%'],
            opacity: [0, 0.9, 0.9, 0],
            x: [0, Math.sin(i * 0.5) * 25, Math.cos(i * 0.7) * -20, 0],
            scale: [0.5, 1, 1.1, 0.8]
          }}
          transition={{ 
            duration: 2.5 + Math.random() * 1.5, 
            delay: 0.8 + i * 0.25,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Reflets de lumière sur l'eau */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
        }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    // Phases de l'animation étalées sur 5 secondes
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const t4 = setTimeout(() => setPhase(4), 3800);
    const t5 = setTimeout(() => onComplete(), 5000);
    
    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3); 
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const bubbles = Array.from({ length: 18 }, (_, i) => ({ 
    id: i, 
    delay: i * 0.18, 
    size: 18 + Math.random() * 45, 
    left: 5 + Math.random() * 90, 
    duration: 2.5 + Math.random() * 1.5 
  }));
  
  const fireParticles = Array.from({ length: 14 }, (_, i) => ({ 
    id: i, 
    delay: i * 0.06, 
    x: (i - 7) * 10 
  }));
  
  const sparkles = [
    { x: 15, y: 20, delay: 0 }, 
    { x: 85, y: 25, delay: 0.15 }, 
    { x: 10, y: 55, delay: 0.3 }, 
    { x: 90, y: 50, delay: 0.2 }, 
    { x: 50, y: 10, delay: 0.35 }, 
    { x: 25, y: 80, delay: 0.4 }, 
    { x: 75, y: 75, delay: 0.25 },
    { x: 40, y: 35, delay: 0.45 },
    { x: 60, y: 65, delay: 0.5 }
  ];
  
  const laughs = [
    { x: 20, y: 30, delay: 0 }, 
    { x: 78, y: 35, delay: 0.4 }, 
    { x: 15, y: 60, delay: 0.7 }, 
    { x: 82, y: 55, delay: 0.3 },
    { x: 50, y: 75, delay: 0.9 }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #FDFEFE 0%, #F5F3F5 50%, #ECEBEC 100%)' }} 
        initial={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.6 }}
      >
        {/* Effet de vague qui monte comme l'eau */}
        <RisingWater />
        
        {/* Animated elements */}
        {phase >= 1 && bubbles.map(b => <FloatingBubble key={b.id} {...b} />)}
        {phase >= 2 && fireParticles.map(p => <FireParticle key={p.id} {...p} />)}
        {phase >= 3 && sparkles.map((s, i) => <Sparkle key={i} {...s} />)}
        {phase >= 1 && laughs.map((l, i) => <LaughEmoji key={i} {...l} />)}
        
        {/* Main content */}
        <div className="relative z-30 flex flex-col items-center">
          <motion.div 
            className="relative" 
            initial={{ scale: 0, rotate: -180 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.3 }}
          >
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-full" 
              style={{ 
                background: 'radial-gradient(circle, rgba(243,55,145,0.4) 0%, transparent 70%)', 
                filter: 'blur(25px)',
                transform: 'scale(1.5)'
              }} 
              animate={{ scale: [1.5, 1.8, 1.5], opacity: [0.5, 0.8, 0.5] }} 
              transition={{ duration: 2.5, repeat: Infinity }} 
            />
            
            {/* Main logo container */}
            <motion.div 
              className="relative w-36 h-36 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden" 
              style={{ boxShadow: '0 0 60px rgba(243,55,145,0.4), 0 15px 50px rgba(0,0,0,0.15)' }} 
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.span 
                className="text-6xl"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎈
              </motion.span>
              
              {/* Cadenas badge */}
              <motion.div 
                className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-br from-[#336907] to-[#4a8f0a] rounded-full flex items-center justify-center shadow-lg" 
                initial={{ scale: 0, rotate: -90 }} 
                animate={{ scale: 1, rotate: 0 }} 
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                <motion.svg 
                  className="w-6 h-6 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
                >
                  <path d="M12 1C8.676 1 6 3.676 6 7v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </motion.svg>
              </motion.div>
            </motion.div>
            
            {/* Ripple effects */}
            <motion.div 
              className="absolute inset-0 rounded-full border-3 border-[#F33791]" 
              initial={{ scale: 1, opacity: 0.8 }} 
              animate={{ scale: 3, opacity: 0 }} 
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} 
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-3 border-[#336907]" 
              initial={{ scale: 1, opacity: 0.6 }} 
              animate={{ scale: 2.5, opacity: 0 }} 
              transition={{ duration: 2, repeat: Infinity, delay: 1 }} 
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-[#FFD700]" 
              initial={{ scale: 1, opacity: 0.5 }} 
              animate={{ scale: 2, opacity: 0 }} 
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} 
            />
          </motion.div>
          
          {/* Title */}
          <motion.h1 
            className="mt-10 text-4xl md:text-5xl font-bold text-center" 
            style={{ fontFamily: 'Space Grotesk' }} 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.span 
              className="text-[#1A1A1A]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              Les{' '}
            </motion.span>
            <motion.span 
              className="text-[#F33791]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              Bulles
            </motion.span>
            <motion.span 
              className="text-[#1A1A1A]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              {' '}de{' '}
            </motion.span>
            <motion.span 
              className="text-[#336907]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.4 }}
            >
              Joie
            </motion.span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="mt-4 text-[#A3A7A1] text-xl font-medium tracking-wide" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            Résultats Scolaires Sécurisés
          </motion.p>
          
          {/* Security badge */}
          <motion.div 
            className="mt-8 flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-[#ECEBEC]" 
            initial={{ opacity: 0, scale: 0.8, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ delay: 2.2, duration: 0.5, type: "spring" }}
          >
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }} 
              transition={{ duration: 0.6, delay: 2.5 }}
            >
              <svg className="w-5 h-5 text-[#336907]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <span className="text-base text-[#1A1A1A] font-semibold">Connexion 100% Sécurisée</span>
            <motion.div
              className="w-2 h-2 rounded-full bg-[#336907]"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Loading indicator */}
          <motion.div 
            className="mt-10 flex items-center gap-3" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 2.8 }}
          >
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div 
                  key={i} 
                  className="w-2.5 h-2.5 rounded-full bg-[#F33791]" 
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [0.4, 1, 0.4],
                    y: [0, -5, 0]
                  }} 
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }} 
                />
              ))}
            </div>
            <span className="text-sm text-[#A3A7A1] font-medium">Préparation de votre espace...</span>
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div 
          className="absolute bottom-6 flex flex-col items-center gap-2" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.7 }} 
          transition={{ delay: 3 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="text-xs text-[#A3A7A1]">Parakou, Bénin</span>
          </div>
          <p className="text-xs text-[#A3A7A1]">
            © 2017-2025 Les Bulles de Joie
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
