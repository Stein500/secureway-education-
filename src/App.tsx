import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { FontProvider } from './providers/FontProvider';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SplashScreen } from './components/SplashScreen';
import { PWAInstallButton } from './components/PWAInstallButton';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  // L'intro s'affiche à chaque rafraîchissement de la page
  const [showSplash, setShowSplash] = useState(true);

  // Demander la permission de notification au chargement
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // On ne demande pas immédiatement, on attend une action utilisateur
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#ECEBEC]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#F33791] animate-spin" />
          </div>
          <p className="text-[#A3A7A1] font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? <DashboardPage key="dashboard" /> : <LoginPage key="login" />}
    </AnimatePresence>
  );
}

function App() {
  return (
    <FontProvider>
      <AuthProvider>
        <AppContent />
        <PWAInstallButton />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FDFEFE',
              color: '#1A1A1A',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1px solid #ECEBEC',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#336907',
                secondary: '#FDFEFE',
              },
            },
            error: {
              iconTheme: {
                primary: '#F33791',
                secondary: '#FDFEFE',
              },
            },
          }}
        />
      </AuthProvider>
    </FontProvider>
  );
}

export default App;
