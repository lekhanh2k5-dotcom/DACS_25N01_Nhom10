import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import './AdminSettings.css'

export default function AdminSettings() {
    const { theme, toggleTheme } = useTheme()
    const { language, toggleLanguage, t } = useLanguage()

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>⚙️ {t('settings.title')}</h1>
            </div>

            {/* GIAO DIỆN */}
            <div className="admin-settings-card">
                <div className="admin-settings-title">{t('settings.interface')}</div>
                <div className="admin-settings-row">
                    <div className="admin-settings-label">
                        <div className="admin-settings-name">{t('settings.mode')}</div>
                        <div className="admin-settings-current">
                            {theme === 'light' ? t('settings.light') : t('settings.dark')}
                        </div>
                    </div>
                    <div className="admin-settings-controls">
                        <button
                            className={`admin-settings-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => theme === 'light' && toggleTheme()}
                        >
                            🌙 {t('settings.dark')}
                        </button>
                        <button
                            className={`admin-settings-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => theme === 'dark' && toggleTheme()}
                        >
                            ☀️ {t('settings.light')}
                        </button>
                    </div>
                </div>
            </div>

            {/* NGÔN NGỮ */}
            <div className="admin-settings-card">
                <div className="admin-settings-title">{t('settings.language')}</div>
                <div className="admin-settings-row">
                    <div className="admin-settings-label">
                        <div className="admin-settings-name">{t('settings.display')}</div>
                        <div className="admin-settings-current">
                            {language === 'vi' ? t('settings.vietnam') : t('settings.english')}
                        </div>
                    </div>
                    <div className="admin-settings-controls">
                        <button
                            className={`admin-settings-btn ${language === 'vi' ? 'active' : ''}`}
                            onClick={() => language === 'en' && toggleLanguage()}
                        >
                            🇻🇳 {t('settings.vietnam')}
                        </button>
                        <button
                            className={`admin-settings-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => language === 'vi' && toggleLanguage()}
                        >
                            🇬🇧 {t('settings.english')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
