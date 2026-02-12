import { useMemo, useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./Settings.css";

export default function Settings() {
    const [game, setGame] = useState("Sky");
    const [lang, setLang] = useState("Việt");
    const { theme, toggleTheme } = useTheme();  // Lấy theme từ ThemeContext

    // Load settings từ localStorage khi component mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                const { game: savedGame, lang: savedLang } = JSON.parse(savedSettings);
                if (savedGame) setGame(savedGame);
                if (savedLang) setLang(savedLang);
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }, []);

    // Lưu settings vào localStorage khi thay đổi
    useEffect(() => {
        try {
            localStorage.setItem('appSettings', JSON.stringify({ game, lang }));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }, [game, lang]);



    const gameTabs = useMemo(() => ["Sky", "Genshin", "Where Wind Meet", "Roblox", "Heartopia/15"], []);

    return (
        <div className="ios-page">
            <header className="ios-header">
                <div className="ios-h1">Cài đặt</div>
                <div className="ios-h2">Tùy chọn nhanh</div>
            </header>

            {/* TRÒ CHƠI */}
            <section className="ios-section">
                <div className="ios-section-title">Trò chơi</div>
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
                <div className="ios-section-title">Giao diện</div>
                <div className="ios-row">
                    <div className="ios-row-left">
                        <div className="ios-row-label">Chế độ</div>
                        <div className="ios-row-value">{theme === 'light' ? 'Sáng' : 'Tối'}</div>
                    </div>
                    <div className="ios-row-right">
                        <div className="ios-seg small">
                            <button
                                type="button"
                                className={`ios-seg-btn ${theme === 'dark' ? "active" : ""}`}
                                onClick={() => theme === 'light' && toggleTheme()}
                            >
                                Tối
                            </button>
                            <button
                                type="button"
                                className={`ios-seg-btn ${theme === 'light' ? "active" : ""}`}
                                onClick={() => theme === 'dark' && toggleTheme()}
                            >
                                Sáng
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* NGÔN NGỮ */}
            <section className="ios-section">
                <div className="ios-section-title">Ngôn ngữ</div>
                <div className="ios-row">
                    <div className="ios-row-left">
                        <div className="ios-row-label">Hiển thị</div>
                        <div className="ios-row-value">{lang}</div>
                    </div>
                    <div className="ios-row-right">
                        <div className="ios-seg small">
                            {["Việt", "Anh"].map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    className={`ios-seg-btn ${lang === l ? "active" : ""}`}
                                    onClick={() => setLang(l)}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="ios-section">
                <div className="ios-section-title">Phím tắt</div>

                <div className="hotkey-list">
                    <div className="hotkey-item">
                        <div className="hotkey-left">
                            <div className="hotkey-name">Bài trước</div>
                            <div className="hotkey-desc">Prev</div>
                        </div>
                        <div className="hotkey-keys" aria-label="Ctrl Shift C">
                            <span className="keycap">Ctrl</span>
                            <span className="keycap">Shift</span>
                            <span className="keycap">C</span>
                        </div>
                    </div>

                    <div className="hotkey-item">
                        <div className="hotkey-left">
                            <div className="hotkey-name">Phát / Dừng</div>
                            <div className="hotkey-desc">Play / Stop</div>
                        </div>
                        <div className="hotkey-keys" aria-label="Ctrl Shift V">
                            <span className="keycap">Ctrl</span>
                            <span className="keycap">Shift</span>
                            <span className="keycap">V</span>
                        </div>
                    </div>

                    <div className="hotkey-item">
                        <div className="hotkey-left">
                            <div className="hotkey-name">Bài tiếp</div>
                            <div className="hotkey-desc">Next</div>
                        </div>
                        <div className="hotkey-keys" aria-label="Ctrl Shift B">
                            <span className="keycap">Ctrl</span>
                            <span className="keycap">Shift</span>
                            <span className="keycap">B</span>
                        </div>
                    </div>
                </div>

                <div className="ios-mini" style={{ marginTop: 10 }}>
                    Phím tắt này là cố định và không thể chỉnh sửa.
                </div>
            </section>
            {/* ABOUT */}
            <section className="ios-section">
                <div className="ios-section-title">Về ứng dụng</div>
                <div className="ios-row">
                    <div className="ios-row-left">
                        <div className="ios-row-label">Phiên bản</div>
                        <div className="ios-row-value">SkyBard v1.0.0</div>
                    </div>
                    <div className="ios-row-right ios-muted">—</div>
                </div>
            </section>
        </div>
    );
}
