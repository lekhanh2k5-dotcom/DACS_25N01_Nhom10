import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import Store from './pages/Store';
import Library from './pages/Library';
import Settings from './pages/Settings';
import AccountPage from './pages/AccountPage';
import LoginModal from './components/LoginModal';
import { useState } from 'react';

function AppContent() {
  const { activeTab, loading: appLoading } = useApp();
  const { loading: authLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}