import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Sidebar.css';

export default function Sidebar({ onLoginClick }) {
    const { activeTab, setActiveTab } = useApp();
    const { user, userProfile } = useAuth();
    const { t } = useLanguage();

    const handleLoginClick = () => {
        if (!user) {
            if (onLoginClick) onLoginClick();
        } else {
            setActiveTab('account');
        }
    };

    const navItems = [
        { id: 'store', label: `🏪 ${t('sidebar.store')}`, icon: '🏪' },
        { id: 'library', label: `📚 ${t('sidebar.library')}`, icon: '📚' },
        { id: 'settings', label: `⚙️ ${t('sidebar.settings')}`, icon: '⚙️' },
    ];

    return (
        <aside className="sidebar">
            <div className="brand">
                <span>🎵</span> SkyBard
            </div>

            <ul className="nav-menu">
                {navItems.map((item) => (
                    <li
                        key={item.id}
                        id={`nav-${item.id}`}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span>{item.icon}</span>
                        {item.label.replace(/^[^\s]+\s/, '')}
                    </li>
                ))}
            </ul>

            <div
                className="user-profile"
                onClick={handleLoginClick}
                style={{ cursor: !user ? 'pointer' : 'default' }}
                title={!user ? 'Click để đăng nhập' : ''}
            >
                <div className="user-avatar">
                    {user ? '👤' : '🔒'}
                </div>
                <div className="user-info">
                    <div className="user-name">
                        {user
                            ? (userProfile?.displayName || user.email.split('@')[0])
                            : t('account.logout')
                        }
                    </div>
                    <div className="user-balance">
                        💰 {userProfile ? `${userProfile.coins.toLocaleString()} ${t('account.coins')}` : `-- ${t('account.coins')}`}
                    </div>
                </div>
            </div>
        </aside>
    );
}