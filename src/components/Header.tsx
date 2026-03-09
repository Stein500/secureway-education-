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
        background: 'rgba(248,247,244,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(12,12,11,0.07)',
        boxShadow: '0 1px 0 rgba(12,12,11,0.04)',
      }}
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #F33791 0%, #FF9DCB 35%, #336907 65%, #80C840 100%)' }} />

      <div className="max-w-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">

          {/* Logo wordmark */}
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center overflow-hidden"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 7px rgba(243,55,145,0.14), 0 0 0 1px rgba(243,55,145,0.09)' }}>
                <img src="/logo.png" alt="Les Bulles de Joie" className="w-7 h-7 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-[5px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #336907, #5CB830)', boxShadow: '0 1px 4px rgba(51,105,7,0.4)' }}
                animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.8, repeat: Infinity }}
              >
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </div>

            <div>
              <p className="leading-none mb-0.5" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#F33791' }}>Les Bulles</span>{' '}
                <span style={{ color: '#336907' }}>de Joie</span>
              </p>
              <p className="hidden sm:block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, fontSize: 10, color: '#7A7A74', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Résultats Sécurisés
              </p>
            </div>
          </motion.div>

          {/* Connected student name */}
          {isAuthenticated && student && (
            <motion.div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(51,105,7,0.07)', border: '1px solid rgba(51,105,7,0.12)' }}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#336907' }}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 12, color: '#336907' }}>
                {student.fullName}
              </span>
            </motion.div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Font toggle */}
            <motion.button
              onClick={toggleFontStyle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-base"
              style={{ background: 'rgba(51,105,7,0.06)', border: '1px solid rgba(51,105,7,0.11)' }}
              whileHover={{ scale: 1.05, background: 'rgba(51,105,7,0.1)' }}
              whileTap={{ scale: 0.94 }}
              title="Changer le style de police"
            >
              <span style={{ fontSize: 14 }}>{fontStyle === 'script' ? '✏️' : '🖋️'}</span>
              {/* Toggle pill */}
              <div className="w-7 h-3.5 rounded-full relative"
                style={{ background: 'rgba(51,105,7,0.18)' }}>
                <motion.div
                  className="absolute top-0.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: '#336907' }}
                  animate={{ left: fontStyle === 'script' ? 2 : 14 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                />
              </div>
            </motion.button>

            <PWAInstallButtonCompact />

            {/* Year badge */}
            <motion.div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(243,55,145,0.07)', border: '1px solid rgba(243,55,145,0.11)' }}
              whileHover={{ scale: 1.04 }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F33791' }}
                animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 11, color: '#F33791' }}>
                2025-2026
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
