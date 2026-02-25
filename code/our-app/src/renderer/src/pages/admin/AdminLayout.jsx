import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import './AdminLayout.css'
import Dashboard from './Dashboard'
import UsersManagement from './UsersManagement'
import SongsManagement from './SongsManagement'
import TransactionsManagement from './TransactionsManagement'
import AdminSettings from './AdminSettings'

export default function AdminLayout() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const { user, userProfile } = useAuth()
    const { t } = useLanguage()
    const { theme } = useTheme()

    const navItems = [
        { id: 'dashboard', label: t('admin.dashboard'), icon: '📊' },
        { id: 'users', label: t('admin.usersManagement'), icon: '👥' },
        { id: 'songs', label: t('admin.songsManagement'), icon: '🎵' },
        { id: 'transactions', label: t('admin.transactionsManagement'), icon: '💰' },
        { id: 'settings', label: t('settings.title'), icon: '⚙️' },
    ]

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span>🛡️</span> Admin
                </div>

                <ul className="admin-nav-menu">
                    {navItems.map((item) => (
                        <li
                            key={item.id}
                            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </li>
                    ))}
                </ul>

                <div className="admin-user-info">
                    <div className="admin-avatar">👤</div>
                    <div className="admin-user-details">
                        <div className="admin-user-name">
                            {userProfile?.displayName || user?.email?.split('@')[0] || 'Admin'}
                        </div>
                        <div className="admin-user-role">Quản trị viên</div>
                    </div>
                </div>
            </aside>

            <main className="admin-main-content">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'users' && <UsersManagement />}
                {activeTab === 'songs' && <SongsManagement />}
                {activeTab === 'transactions' && <TransactionsManagement />}
                {activeTab === 'settings' && <AdminSettings />}
            </main>
        </div>
    )
}
