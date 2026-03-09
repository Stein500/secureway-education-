import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) setIsVisible(false);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsVisible(false);
    } catch (error) { 
      console.error('Installation error:', error); 
    } finally { 
      setIsInstalling(false); 
      setDeferredPrompt(null); 
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-6 right-6 z-50" 
        initial={{ opacity: 0, scale: 0, y: 50 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0, y: 50 }} 
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <AnimatePresence>
          {showTooltip && (
            <motion.div 
              className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-white rounded-2xl shadow-xl border border-[#ECEBEC]" 
              initial={{ opacity: 0, y: 10, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
            >
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-[#ECEBEC] transform rotate-45" />
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F33791] to-[#FF6B9D] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] text-sm">Installer l'Application</h4>
                  <p className="text-xs text-[#A3A7A1] mt-1">Accédez rapidement aux résultats depuis votre écran d'accueil</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#336907]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Sécurisé • Hors-ligne disponible</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button 
          onClick={handleInstall} 
          onMouseEnter={() => setShowTooltip(true)} 
          onMouseLeave={() => setShowTooltip(false)} 
          disabled={isInstalling} 
          className="group relative flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-lg border border-[#ECEBEC] hover:border-[#F33791] transition-all duration-300 overflow-hidden" 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F33791]/10 to-transparent" 
            initial={{ x: '-100%' }} 
            whileHover={{ x: '100%' }} 
            transition={{ duration: 0.6 }} 
          />
          <motion.div 
            className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#F33791] to-[#FF6B9D] flex items-center justify-center" 
            animate={isInstalling ? { rotate: 360 } : { y: [0, -3, 0] }} 
            transition={isInstalling ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
          >
            {isInstalling ? (
              <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-[#336907] rounded-full flex items-center justify-center" 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.div>
          <div className="relative text-left">
            <p className="text-sm font-semibold text-[#1A1A1A]">Installer</p>
            <p className="text-xs text-[#A3A7A1]">Accès rapide</p>
          </div>
          <motion.div 
            className="relative" 
            animate={{ x: [0, 5, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-5 h-5 text-[#F33791]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

export function PWAInstallButtonCompact() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handler = (e: Event) => { 
      e.preventDefault(); 
      setDeferredPrompt(e as BeforeInstallPromptEvent); 
      setIsVisible(true); 
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) setIsVisible(false);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try { 
      await deferredPrompt.prompt(); 
      const { outcome } = await deferredPrompt.userChoice; 
      if (outcome === 'accepted') setIsVisible(false); 
    } catch (error) { 
      console.error(error); 
    } finally { 
      setDeferredPrompt(null); 
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.button 
      onClick={handleInstall} 
      className="flex items-center gap-2 px-3 py-1.5 bg-[#F33791]/10 hover:bg-[#F33791]/20 text-[#F33791] rounded-full text-sm font-medium transition-colors" 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        animate={{ y: [0, -2, 0] }} 
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </motion.svg>
      <span>Installer</span>
    </motion.button>
  );
}