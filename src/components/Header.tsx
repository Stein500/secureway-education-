import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { useFont } from '../providers/FontProvider';
import { PWAInstallButtonCompact } from './PWAInstallButton';

export function Header() {
  const { isAuthenticated, student } = useAuth();
  const { fontStyle, toggleFontStyle } = useFont();

  return (
    <motion.header 
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#ECEBEC] gpu-accelerated" 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et nom - toujours visible */}
          <motion.div 
            className="flex items-center gap-3" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-[#ECEBEC] flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Les Bulles de Joie" 
                  className="w-8 h-8 object-contain" 
                  onError={(e) => { 
                    (e.target as HTMLImageElement).style.display = 'none'; 
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); 
                  }} 
                />
                <span className="hidden text-xl">🎈</span>
              </div>
              <motion.div 
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#336907] rounded-md flex items-center justify-center shadow-sm" 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </div>
            
            {/* Nom de l'école - toujours visible */}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#1A1A1A] leading-tight">
                <span className="text-[#F33791]">Les Bulles</span> <span className="text-[#336907]">de Joie</span>
              </h1>
              <p className="text-xs text-[#A3A7A1] hidden sm:block">Résultats Sécurisés</p>
            </div>
          </motion.div>

          {/* Zone centrale - Info utilisateur connecté */}
          {isAuthenticated && student && (
            <motion.div 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ECEBEC]/50 rounded-full" 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-2 h-2 bg-[#336907] rounded-full animate-pulse" />
              <span className="text-sm text-[#1A1A1A] font-medium">{student.fullName}</span>
            </motion.div>
          )}

          {/* Zone droite - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton Script/Cursive */}
            <motion.button
              onClick={toggleFontStyle}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-[#336907]/10 hover:bg-[#336907]/20 rounded-full transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={fontStyle === 'script' ? 'Passer en écriture cursive' : 'Passer en écriture script'}
            >
              <motion.span 
                className="text-sm sm:text-base"
                animate={{ rotate: fontStyle === 'cursive' ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {fontStyle === 'script' ? '✏️' : '🖋️'}
              </motion.span>
              <span className="text-xs font-medium text-[#336907] hidden sm:inline">
                {fontStyle === 'script' ? 'Script' : 'Cursive'}
              </span>
              <motion.div
                className="w-8 h-4 bg-white rounded-full relative shadow-inner border border-[#336907]/20"
                style={{ padding: 2 }}
              >
                <motion.div
                  className="w-3 h-3 bg-[#336907] rounded-full absolute top-0.5"
                  animate={{ left: fontStyle === 'script' ? 2 : 18 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.div>
            </motion.button>

            {/* Bouton installer PWA */}
            <PWAInstallButtonCompact />
            
            {/* Badge année scolaire */}
            <motion.div 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F33791]/10 rounded-full" 
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-1.5 h-1.5 bg-[#F33791] rounded-full" 
                animate={{ scale: [1, 1.3, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity }} 
              />
              <span className="text-xs font-semibold text-[#F33791]">2025-2026</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
