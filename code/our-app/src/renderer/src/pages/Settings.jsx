import { useMemo, useState } from "react";
import "./Settings.css";

function buildNotesFromC3(count) {
    const order = ["C", "D", "E", "F", "G", "A", "B"];
    let octave = 3;
    let idx = 0;
    const res = [];

    for (let i = 0; i < count; i++) {
        res.push(`${order[idx]}${octave}`);
        idx++;
        if (idx === order.length) {
            idx = 0;
            octave++;
        }
    }
    return res;
}

export default function Settings() {
    const [game, setGame] = useState("Sky");
    const [theme, setTheme] = useState("Tối");
    const [lang, setLang] = useState("Việt");

    // mở/đóng khu mapping 
    const [openMapping, setOpenMapping] = useState(true);
    const [quickLayout, setQuickLayout] = useState("Sky"); // Sky | Genshin

    const skyKeys = useMemo(
        () => ["Y", "u", "i", "o", "p", "h", "j", "k", "l", ";", "n", "m", ",", ".", "/"],
        []
    );

    const genshinKeys = useMemo(
        () => ["z", "x", "c", "v", "b", "n", "m", "a", "s", "d", "f", "g", "h", "j", "q", "w", "e", "r", "t", "y", "u"],
        []
    );

    const mappingRows = useMemo(() => {
        const keys = quickLayout === "Sky" ? skyKeys : genshinKeys;
        const notes = buildNotesFromC3(keys.length);
        return notes.map((note, i) => ({ note, key: keys[i] || "—" }));
    }, [quickLayout, skyKeys, genshinKeys]);

    const gameTabs = useMemo(() => ["Sky", "Genshin", "Roblox", "Tùy chỉnh"], []);
    const layoutTabs = useMemo(() => ["Sky", "Genshin"], []);

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
                        <div className="ios-row-value">{theme}</div>
                    </div>
                    <div className="ios-row-right">
                        <div className="ios-seg small">
                            {["Tối", "Sáng"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`ios-seg-btn ${theme === t ? "active" : ""}`}
                                    onClick={() => setTheme(t)}
                                >
                                    {t}
                                </button>
                            ))}
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

            {/* TÙY CHỈNH PHÍM ↔ NỐT */}
            <section className="ios-section">
                <button
                    type="button"
                    className="ios-collapse-head"
                    onClick={() => setOpenMapping((v) => !v)}
                >
                    <div className="ios-collapse-left">
                        <div className="ios-section-title" style={{ marginBottom: 0 }}>
                            Tùy chỉnh phím ↔ nốt
                        </div>
                        <div className="ios-mini">
                            Bắt đầu từ <b>C3</b>
                        </div>
                    </div>

                    <div className={`ios-chev ${openMapping ? "open" : ""}`}>›</div>
                </button>

                <div className={`ios-collapse-body ${openMapping ? "open" : ""}`}>
                    <div className="ios-row" style={{ marginTop: 10 }}>
                        <div className="ios-row-left">
                            <div className="ios-row-label">Layout nhanh</div>
                            <div className="ios-row-value">{quickLayout}</div>
                        </div>
                        <div className="ios-row-right">
                            <div className="ios-seg small">
                                {layoutTabs.map((x) => (
                                    <button
                                        key={x}
                                        type="button"
                                        className={`ios-seg-btn ${quickLayout === x ? "active" : ""}`}
                                        onClick={() => setQuickLayout(x)}
                                    >
                                        {x}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="map-list">
                        {mappingRows.map((row) => (
                            <div className="map-item" key={row.note}>
                                <div className="map-note">{row.note}</div>
                                <div className="map-mid">→</div>
                                <div className="map-key">{row.key}</div>
                                <button className="map-change" disabled>
                                    Đổi
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="map-actions">
                        <button className="ios-ghost" disabled>
                            + Thêm dòng
                        </button>
                        <button className="ios-primary" disabled>
                            Lưu (sắp có)
                        </button>
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
