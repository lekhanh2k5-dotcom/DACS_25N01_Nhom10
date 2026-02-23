import { useMemo, useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import "./Settings.css";

export default function Settings() {
    const [game, setGame] = useState("Sky");
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();

    // Load settings từ localStorage khi component mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                const { game: savedGame } = JSON.parse(savedSettings);
                if (savedGame) setGame(savedGame);
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }, []);

    // Lưu settings vào localStorage khi thay đổi
    useEffect(() => {
        try {
            localStorage.setItem('appSettings', JSON.stringify({ game }));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }, [game]);

    const gameTabs = useMemo(() => ["Sky", "Genshin", "Where Wind Meet", "Roblox", "Heartopia/15"], []);

    return (
        <div className="ios-page">
            <header className="ios-header">
                <div className="ios-h1">{t('settings.title')}</div>
                <div className="ios-h2">{t('settings.quickSettings')}</div>
            </header>

            {/* TRÒ CHƠI */}
            <section className="ios-section">
                <div className="ios-section-title">{t('settings.game')}</div>
                <div className="ios-seg">
                    {gameTabs.map((g) => (
                        <button
                            key={g}
                            type="button"
                            className={`ios-seg-btn ${game === g ? "active" : ""}`}
                            onClick={() => setGame(g)}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </section>

            {/* GIAO DIỆN */}
            <section className="ios-section">
                <div className="ios-section-title">{t('settings.interface')}</div>
                <div className="ios-row">
                    <div className="ios-row-left">
                        <div className="ios-row-label">{t('settings.mode')}</div>
                        <div className="ios-row-value">{theme === 'light' ? t('settings.light') : t('settings.dark')}</div>
                    </div>
                    <div className="ios-row-right">
                        <div className="ios-seg small">
                            <button
                                type="button"
                                className={`ios-seg-btn ${theme === 'dark' ? "active" : ""}`}
                                onClick={() => theme === 'light' && toggleTheme()}
                            >
                                {t('settings.dark')}
                            </button>
                            <button
                                type="button"
                                className={`ios-seg-btn ${theme === 'light' ? "active" : ""}`}
                                onClick={() => theme === 'dark' && toggleTheme()}
                            >
                                {t('settings.light')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* NGÔN NGỮ */}
            <section className="ios-section">
                <div className="ios-section-title">{t('settings.language')}</div>
                <div className="ios-row">
                    <div className="ios-row-left">
                        <div className="ios-row-label">{t('settings.display')}</div>
                        <div className="ios-row-value">{language === 'vi' ? t('settings.vietnam') : t('settings.english')}</div>
                    </div>
                    <div className="ios-row-right">
                        <div className="ios-seg small">
                            <button
                                type="button"
                                className={`ios-seg-btn ${language === 'vi' ? "active" : ""}`}
                                onClick={() => language === 'en' && toggleLanguage()}
                            >
                                {t('settings.vietnam')}
                            </button>
                            <button
                                type="button"
                                className={`ios-seg-btn ${language === 'en' ? "active" : ""}`}
                                onClick={() => language === 'vi' && toggleLanguage()}
                            >
                                {t('settings.english')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ios-section">
                <div className="ios-section-title">{t('settings.shortcuts')}</div>

                <div className="hotkey-list">
                    <div className="hotkey-item">
                        <div className="hotkey-left">
                            <div className="hotkey-name">{t('settings.prevSong')}</div>
                            <div className="hotkey-desc">{t('settings.prevDesc')}</div>
                        </div>
                        <div className="hotkey-keys" aria-label="Ctrl Shift C">
                            <span className="keycap">Ctrl</span>
                            <span className="keycap">Shift</span>
                            <span className="keycap">C</span>
                        </div>
                    </div>

                    <div className="hotkey-item">
                        <div className="hotkey-left">
                            <div className="hotkey-name">{t('settings.playpause')}</div>
                            <div className="hotkey-desc">{t('settings.playDesc')}</div>
                        </div>
                        <div className="hotkey-keys" aria-label="Ctrl Shift V">
                            <span className="keycap">Ctrl</span>
                            <span className="keycap">Shift</span>
                            <span className="keycap">V</span>
                        </div>
                    </div>

                    <div className="hotkey-item">
                        <div className="hotkey-left">
                            <div className="hotkey-name">{t('settings.nextSong')}</div>
                            <div className="hotkey-desc">{t('settings.nextDesc')}</div>
                        </div>
                        <div className="hotkey-keys" aria-label="Ctrl Shift B">
                            <span className="keycap">Ctrl</span>
                            <span className="keycap">Shift</span>
                            <span className="keycap">B</span>
                        </div>
                    </div>
                </div>

                <div className="ios-mini" style={{ marginTop: 10 }}>
                    {t('settings.shortcutNote')}
                </div>
            </section>
            {/* ABOUT */}
            <section className="ios-section">
                <div className="ios-section-title">{t('aboutApp.title')}</div>
                <div className="ios-row">
                    <div className="ios-row-left">
                        <div className="ios-row-label">{t('aboutApp.version')}</div>
                        <div className="ios-row-value">SkyBard v1.0.0</div>
                    </div>
                    <div className="ios-row-right ios-muted">—</div>
                </div>
            </section>
        </div>
    );
}
