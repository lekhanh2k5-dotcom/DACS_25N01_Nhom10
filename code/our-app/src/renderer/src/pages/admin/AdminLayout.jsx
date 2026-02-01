import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './AdminLayout.css'
import Dashboard from './Dashboard'

export default function AdminLayout() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const { user, userProfile } = useAuth()

    const navItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
        { id: 'users', label: 'Người dùng', icon: '👥' },
        { id: 'songs', label: 'Bài hát', icon: '🎵' },
        { id: 'transactions', label: 'Giao dịch', icon: '💰' },
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
                {activeTab === 'users' && (
                    <div className="admin-page">
                        <div className="admin-page-header">
                            <h1>👥 Quản lý người dùng</h1>
                        </div>
                        <p>Đang phát triển...</p>
                    </div>
                )}
                {activeTab === 'songs' && (
                    <div className="admin-page">
                        <div className="admin-page-header">
                            <h1>🎵 Quản lý bài hát</h1>
                        </div>
                        <p>Đang phát triển...</p>
                    </div>
                )}
                {activeTab === 'transactions' && (
                    <div className="admin-page">
                        <div className="admin-page-header">
                            <h1>💰 Quản lý giao dịch</h1>
                        </div>
                        <p>Đang phát triển...</p>
                    </div>
                )}
            </main>
        </div>
    )
}
