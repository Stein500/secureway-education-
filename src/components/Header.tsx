import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { useFont } from '../providers/FontProvider';
import { PWAInstallButtonCompact } from './PWAInstallButton';

export function Header() {
  const { isAuthenticated, student } = useAuth();
  const { fontStyle, toggleFontStyle } = useFont();

  return (
    <motion.header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(250,250,248,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(243,55,145,0.08)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)',
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(243,55,145,0.15), 0 0 0 1px rgba(243,55,145,0.1)',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Les Bulles de Joie"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xl">🎈</span>
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #336907, #4CAF20)', boxShadow: '0 1px 4px rgba(51,105,7,0.4)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </div>

            <div>
              <h1 className="text-sm sm:text-base font-bold leading-tight" style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>
                <span style={{ color: '#F33791' }}>Les Bulles</span>{' '}
                <span style={{ color: '#336907' }}>de Joie</span>
              </h1>
              <p className="text-[10px] hidden sm:block" style={{ color: '#A3A7A1', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>RÉSULTATS SÉCURISÉS</p>
            </div>
          </motion.div>

          {/* Center pill — connected student */}
          {isAuthenticated && student && (
            <motion.div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(51,105,7,0.07)',
                border: '1px solid rgba(51,105,7,0.12)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div className="w-1.5 h-1.5 bg-[#336907] rounded-full" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-xs text-[#336907] font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{student.fullName}</span>
            </motion.div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Font toggle */}
            <motion.button
              onClick={toggleFontStyle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all"
              style={{
                background: 'rgba(51,105,7,0.07)',
                border: '1px solid rgba(51,105,7,0.12)',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">{fontStyle === 'script' ? '✏️' : '🖋️'}</span>
              <div
                className="w-7 h-3.5 rounded-full relative"
                style={{ background: 'rgba(51,105,7,0.2)', padding: '2px' }}
              >
                <motion.div
                  className="w-2.5 h-2.5 bg-[#336907] rounded-full absolute top-0.5"
                  animate={{ left: fontStyle === 'script' ? 2 : 14 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.button>

            <PWAInstallButtonCompact />

            {/* School year badge */}
            <motion.div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(243,55,145,0.07)',
                border: '1px solid rgba(243,55,145,0.12)',
              }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-[#F33791]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="text-xs font-semibold text-[#F33791]" style={{ fontFamily: 'Sora, sans-serif' }}>2025-2026</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
