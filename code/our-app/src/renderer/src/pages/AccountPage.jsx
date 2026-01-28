import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { showConfirm } from "../utils/alert";
import "./AccountPage.css";

export default function AccountPage() {
    const { user, userProfile, logout } = useAuth();

    const initial = useMemo(() => {
        const email = user?.email || "";
        return {
            username:
                userProfile?.displayName || (email ? email.split("@")[0] : "user"),
            email,
            coins: userProfile?.coins ?? 0,
            emailVerified: Boolean(user?.emailVerified),
        };
    }, [user, userProfile]);

    const [form, setForm] = useState({
        username: initial.username,
        email: initial.email,
        newPassword: "",
        confirmPassword: "",
    });

    return (
        <div className="acc-page">
            <div className="acc-hero">
                <div>
                    <h2 className="acc-title">Tài khoản</h2>
                    <p className="acc-subtitle">Quản lý thông tin và bảo mật</p>
                </div>

                <button className="acc-logout" onClick={async () => {
                    if (await showConfirm("Bạn có chắc muốn đăng xuất?")) await logout();
                }}>
                    Đăng xuất
                </button>
            </div>

            <div className="acc-grid">
                <section className="acc-card acc-wallet compact">
                    <div className="acc-card-head">
                        <div>
                            <div className="acc-card-title">Ví xu</div>
                            <div className="acc-card-desc">Số dư</div>
                        </div>
                        <span className="acc-pill">💰</span>
                    </div>

                    <div className="wallet-row">
                        <div className="wallet-balance">
                            <div className="wallet-balance-value">
                                {initial.coins.toLocaleString()} <span>xu</span>
                            </div>
                        </div>

                        <button className="acc-primary small">Nạp</button>
                    </div>
                </section>


                {/* RIGHT: Profile + Security */}
                <section className="acc-card">
                    <div className="acc-card-head">
                        <div>
                            <div className="acc-card-title">Thông tin & bảo mật</div>
                            <div className="acc-card-desc">Tên đăng nhập, email, mật khẩu</div>
                        </div>
                        <span className="acc-pill">👤 Profile</span>
                    </div>

                    {/* Username */}
                    <div className="acc-field">
                        <label>Tên đăng nhập</label>
                        <div className="acc-row">
                            <input
                                value={form.username}
                                onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                                placeholder="Nhập tên đăng nhập"
                            />
                            <button className="acc-secondary">Lưu</button>
                        </div>
                        <div className="acc-note">Tên hiển thị = tên đăng nhập.</div>
                    </div>

                    {/* Email */}
                    <div className="acc-field">
                        <label className="acc-label-row">
                            <span>Email</span>
                            {initial.emailVerified ? (
                                <span className="acc-badge ok">Đã xác nhận</span>
                            ) : (
                                <span className="acc-badge warn">Chưa xác nhận</span>
                            )}
                        </label>

                        <div className="acc-row">
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                placeholder="name@example.com"
                            />
                            <button className="acc-secondary">Cập nhật</button>
                        </div>

                        {!initial.emailVerified && (
                            <button className="acc-link">Gửi email xác nhận</button>
                        )}
                    </div>

                    <div className="acc-divider" />

                    {/* Password */}
                    <div className="acc-field">
                        <label>Đổi mật khẩu</label>

                        <input
                            type="password"
                            value={form.currentPassword}
                            onChange={(e) => setForm((s) => ({ ...s, currentPassword: e.target.value }))}
                            placeholder="Mật khẩu hiện tại"
                        />

                        <div className="acc-two">
                            <input
                                type="password"
                                value={form.newPassword}
                                onChange={(e) => setForm((s) => ({ ...s, newPassword: e.target.value }))}
                                placeholder="Mật khẩu mới"
                            />
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                                placeholder="Xác nhận mật khẩu"
                            />
                        </div>

                        <button className="acc-secondary full">Đổi mật khẩu</button>
                    </div>
                </section>
            </div>
        </div>
    );
}
