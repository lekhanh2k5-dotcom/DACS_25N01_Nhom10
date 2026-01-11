import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

export default function Sidebar({ onLoginClick }) {
    const { activeTab, setActiveTab } = useApp();
    const { user, userProfile } = useAuth();

    const handleLoginClick = () => {
        if (!user && onLoginClick) {
            onLoginClick();
        }
    };

    const navItems = [
        { id: 'store', label: 'Cửa hàng', icon: '🏪' },
        { id: 'library', label: 'Thư viện', icon: '📚' },
        { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
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
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </li>
                ))}
            </ul>

            <div
                className="user-profile"
                onClick={handleLoginClick}
                style={{ cursor: !user ? 'pointer' : 'default' }}
            >
                <div className="user-avatar">
                    {user ? '👤' : '🔒'}
                </div>
                <div className="user-info">
                    <div className="user-name">
                        {user
                            ? (userProfile?.displayName || user.email.split('@')[0])
                            : 'Chưa đăng nhập'
                        }
                    </div>
                    <div className="user-balance">
                        💰 {userProfile ? `${userProfile.coins.toLocaleString()} xu` : '-- xu'}
                    </div>
                </div>
            </div>
        </aside>
    );
}