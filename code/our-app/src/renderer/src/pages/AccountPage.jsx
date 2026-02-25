import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { showConfirm, showError, showSuccess, mapFirebaseError } from "../utils/alert";
import "./AccountPage.css";

export default function AccountPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const {
        user,
        userProfile,
        updateUsername,
        updateAccountEmail,
        updateAccountPassword,
        sendVerification,
        logout,
        loading,
    } = useAuth();

    const initial = useMemo(() => {
        const email = user?.email || "";
        return {
            username: userProfile?.displayName || (email ? email.split("@")[0] : "user"),
            email,
            coins: userProfile?.coins ?? 0,
            emailVerified: Boolean(user?.emailVerified),
        };
    }, [user, userProfile]);

    const [form, setForm] = useState({
        username: initial.username,
        email: initial.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    useEffect(() => {
        setForm((s) => ({
            ...s,
            username: initial.username,
            email: initial.email,
        }));
    }, [initial.username, initial.email]);
    useEffect(() => {
        const checkPermission = async () => {
            if (user) {
                try {
                    // idTokenResult(true) ép buộc refresh token để lấy claim mới nhất
                    const idTokenResult = await user.getIdTokenResult(true);
                    setIsAdmin(!!idTokenResult.claims.admin);
                } catch (error) {
                    console.error("Lỗi kiểm tra quyền:", error);
                }
            } else {
                setIsAdmin(false);
            }
        };
        checkPermission();
    }, [user]); // Chạy lại mỗi khi user thay đổi

    const handleOpenAdminWindow = () => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.send('open-admin-window');
        }
    };

    const handleUpdateUsername = async () => {
        if (!form.currentPassword) {
            return showError("Vui lòng nhập mật khẩu hiện tại.");
        }

        try {
            await updateUsername(form.currentPassword, form.username);
            showSuccess("Đã cập nhật tên đăng nhập!");
        } catch (error) {
            showError(mapFirebaseError(error), error.code);
        }
    };


    const handleUpdateEmail = async () => {
        if (!form.currentPassword) {
            return showError("Vui lòng nhập mật khẩu hiện tại.");
        }

        try {
            await updateAccountEmail(form.currentPassword, form.email);
            showSuccess("Vui lòng kiểm tra tin nhắn xác nhận về " + form.email + "!");
        } catch (error) {
            showError(mapFirebaseError(error), error.code);
        }
    };

    const handleChangePassword = async () => {
        if (!form.currentPassword) return showError("Vui lòng nhập mật khẩu hiện tại.");
        if (form.newPassword !== form.confirmPassword) return showError("Mật khẩu xác nhận không khớp!");

        try {
            await updateAccountPassword(form.currentPassword, form.newPassword);
            setForm(s => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" }));
            showSuccess("Mật khẩu đã được thay đổi!");
        } catch (error) {
            showError(mapFirebaseError(error), error.code);
        }
    };

    if (loading) {
        return (
            <div className="acc-page">
                <div className="acc-card">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="acc-page">
            <div className="acc-hero">
                <div>
                    <h2 className="acc-title">Tài khoản</h2>
                    <p className="acc-subtitle">Quản lý thông tin và bảo mật</p>
                </div>
                <div className="acc-actions">
                    {isAdmin && (
                        <button className="acc-admin" onClick={handleOpenAdminWindow}>
                            🛡️ Admin
                        </button>
                    )}

                    <button
                        className="acc-logout"
                        onClick={async () => {
                            if (await showConfirm("Bạn có chắc muốn đăng xuất?")) await logout();
                        }}
                    >
                        Đăng xuất
                    </button>
                </div>

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

                        <button
                            className="acc-primary small"
                            onClick={() => {
                                showConfirm(
                                    "Chức năng nạp tự động chưa được phát triển.\nLiên hệ trực tiếp với KChip nếu bạn muốn nạp xu.\n\nBạn có muốn mở Facebook của KChip không?"
                                ).then((ok) => {
                                    if (ok) {
                                        window.open(
                                            "https://www.facebook.com/profile.php?id=100083202309058",
                                            "_blank",
                                            "noopener,noreferrer"
                                        );
                                    }
                                });
                            }}
                        >
                            Nạp
                        </button>
                    </div>
                </section>



                <section className="acc-card">
                    <div className="acc-card-head">
                        <div>
                            <div className="acc-card-title">Thông tin & bảo mật</div>
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
                            <button className="acc-secondary" onClick={handleUpdateUsername}>
                                Lưu
                            </button>
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
                            <button className="acc-secondary" onClick={handleUpdateEmail}>
                                Cập nhật
                            </button>
                        </div>

                        {!initial.emailVerified && (
                            <button className="acc-link" onClick={() => sendVerification()}>
                                Gửi email xác nhận
                            </button>
                        )}
                    </div>

                    <div className="acc-divider" />

                    {/* Password */}
                    <div className="acc-field">
                        <label>Đổi mật khẩu</label>

                        <input
                            type="password"
                            value={form.currentPassword}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, currentPassword: e.target.value }))
                            }
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
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, confirmPassword: e.target.value }))
                                }
                                placeholder="Xác nhận mật khẩu"
                            />
                        </div>

                        <button className="acc-secondary full" onClick={handleChangePassword}>
                            Đổi mật khẩu
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
