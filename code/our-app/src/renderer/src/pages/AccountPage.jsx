import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { showConfirm, showError, showSuccess, mapFirebaseError } from "../utils/alert";
import { useLanguage } from "../contexts/LanguageContext";
import "./AccountPage.css";

export default function AccountPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const { t, tf } = useLanguage();
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
            return showError(t('account.requireCurrentPassword'));
        }

        try {
            await updateUsername(form.currentPassword, form.username);
            showSuccess(t('account.usernameUpdated'));
        } catch (error) {
            showError(mapFirebaseError(error), error.code);
        }
    };


    const handleUpdateEmail = async () => {
        if (!form.currentPassword) {
            return showError(t('account.requireCurrentPassword'));
        }

        try {
            await updateAccountEmail(form.currentPassword, form.email);
            showSuccess(tf('account.emailUpdated', { email: form.email }));
        } catch (error) {
            showError(mapFirebaseError(error), error.code);
        }
    };

    const handleChangePassword = async () => {
        if (!form.currentPassword) return showError(t('account.requireCurrentPassword'));
        if (form.newPassword !== form.confirmPassword) return showError(t('account.passwordMismatch'));

        try {
            await updateAccountPassword(form.currentPassword, form.newPassword);
            setForm(s => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" }));
            showSuccess(t('account.passwordUpdated'));
        } catch (error) {
            showError(mapFirebaseError(error), error.code);
        }
    };

    if (loading) {
        return (
            <div className="acc-page">
                <div className="acc-card">{t('account.loading')}</div>
            </div>
        );
    }

    return (
        <div className="acc-page">
            <div className="acc-hero">
                <div>
                    <h2 className="acc-title">{t('account.title')}</h2>
                    <p className="acc-subtitle">{t('account.subtitle')}</p>
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
                            if (await showConfirm(t('account.logoutConfirm'))) await logout();
                        }}
                    >
                        {t('account.logout')}
                    </button>
                </div>

            </div>

            <div className="acc-grid">
                <section className="acc-card acc-wallet compact">
                    <div className="acc-card-head">
                        <div>
                            <div className="acc-card-title">{t('account.wallet')}</div>
                            <div className="acc-card-desc">{t('account.balance')}</div>
                        </div>
                        <span className="acc-pill">💰</span>
                    </div>

                    <div className="wallet-row">
                        <div className="wallet-balance">
                            <div className="wallet-balance-value">
                                {initial.coins.toLocaleString()} <span>{t('account.coins')}</span>
                            </div>
                        </div>

                        <button
                            className="acc-primary small"
                            onClick={() => {
                                showConfirm(t('account.topUpMsg')).then((ok) => {
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
                            {t('account.topUp')}
                        </button>
                    </div>
                </section>



                <section className="acc-card">
                    <div className="acc-card-head">
                        <div>
                            <div className="acc-card-title">{t('account.security')}</div>
                        </div>
                        <span className="acc-pill">👤 Profile</span>
                    </div>

                    {/* Username */}
                    <div className="acc-field">
                        <label>{t('account.usernameLabel')}</label>
                        <div className="acc-row">
                            <input
                                value={form.username}
                                onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                                placeholder={t('account.usernamePlaceholder')}
                            />
                            <button className="acc-secondary" onClick={handleUpdateUsername}>
                                {t('account.save')}
                            </button>
                        </div>
                        <div className="acc-note">{t('account.usernameNote')}</div>
                    </div>

                    {/* Email */}
                    <div className="acc-field">
                        <label className="acc-label-row">
                            <span>Email</span>
                            {initial.emailVerified ? (
                                <span className="acc-badge ok">{t('account.verified')}</span>
                            ) : (
                                <span className="acc-badge warn">{t('account.notVerified')}</span>
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
                                {t('account.update')}
                            </button>
                        </div>

                        {!initial.emailVerified && (
                            <button className="acc-link" onClick={() => sendVerification()}>
                                {t('account.sendVerification')}
                            </button>
                        )}
                    </div>

                    <div className="acc-divider" />

                    {/* Password */}
                    <div className="acc-field">
                        <label>{t('account.changePassword')}</label>

                        <input
                            type="password"
                            value={form.currentPassword}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, currentPassword: e.target.value }))
                            }
                            placeholder={t('account.currentPassword')}
                        />

                        <div className="acc-two">
                            <input
                                type="password"
                                value={form.newPassword}
                                onChange={(e) => setForm((s) => ({ ...s, newPassword: e.target.value }))}
                                placeholder={t('account.newPassword')}
                            />
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, confirmPassword: e.target.value }))
                                }
                                placeholder={t('account.confirmPasswordPlaceholder')}
                            />
                        </div>

                        <button className="acc-secondary full" onClick={handleChangePassword}>
                            {t('account.changePassword')}
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
