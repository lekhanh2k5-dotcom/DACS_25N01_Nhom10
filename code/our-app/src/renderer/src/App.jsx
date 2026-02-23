import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import Store from './pages/Store';
import Library from './pages/Library';
import Settings from './pages/Settings';
import AccountPage from './pages/AccountPage';
import LoginModal from './components/LoginModal';
import { useState, useEffect } from 'react';
import AdminLayout from './pages/admin/AdminLayout';
import './assets/theme.css';

function AppContent() {
  const { activeTab, loading: appLoading, togglePlayback, playNext, playPrev } = useApp();
  const { loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger if Ctrl + Shift are pressed
      if (!event.ctrlKey || !event.shiftKey) return;

      switch (event.code) {
        case 'KeyC': // Ctrl + Shift + C = Previous
          event.preventDefault();
          playPrev();
          break;
        case 'KeyV': // Ctrl + Shift + V = Play/Pause
          event.preventDefault();
          togglePlayback();
          break;
        case 'KeyB': // Ctrl + Shift + B = Next
          event.preventDefault();
          playNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback, playNext, playPrev]);

  if (window.location.hash === '#/admin') {
    return <AdminLayout />;
  }

  if (authLoading || appLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>🎵</div>
        <h2>Đang tải SkyBard...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="app-container">
        <Sidebar onLoginClick={() => setIsLoginModalOpen(true)} />

        <main className="main-content">
          {activeTab === 'store' && <Store />}
          {activeTab === 'library' && <Library />}
          {activeTab === 'settings' && <Settings onLoginClick={() => setIsLoginModalOpen(true)} />}
          {activeTab === 'account' && <AccountPage />}
        </main>
      </div>

      <PlayerBar />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}