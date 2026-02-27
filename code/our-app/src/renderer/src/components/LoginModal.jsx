import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showAlert, showSuccess } from '../utils/alert';
import { useLanguage } from '../contexts/LanguageContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const { login, register, resetPassword } = useAuth();
    const { t } = useLanguage();
    const RESET_COOLDOWN_SECONDS = 60;
    const RESET_COOLDOWN_KEY = "reset_pw_cooldown_until";

    const [resetCooldown, setResetCooldown] = useState(0);

    useEffect(() => {
        const until = Number(localStorage.getItem(RESET_COOLDOWN_KEY) || 0);
        const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
        setResetCooldown(left);
    }, []);

    useEffect(() => {
        if (resetCooldown <= 0) return;

        const t = setInterval(() => {
            const until = Number(localStorage.getItem(RESET_COOLDOWN_KEY) || 0);
            const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
            setResetCooldown(left);
            if (left <= 0) clearInterval(t);
        }, 500);

        return () => clearInterval(t);
    }, [resetCooldown]);

    const startResetCooldown = (sec = RESET_COOLDOWN_SECONDS) => {
        const until = Date.now() + sec * 1000;
        localStorage.setItem(RESET_COOLDOWN_KEY, String(until));
        setResetCooldown(sec);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (showRegister) {
                // Validate registration form
                if (!username.trim()) {
                    setError(t('auth.errUsernameRequired'));
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError(t('auth.errPasswordTooShort'));
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError(t('auth.errPasswordMismatch'));
                    setLoading(false);
                    return;
                }
                await register(email, password, username);
                showSuccess(t('validation.registerSuccess'));
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setUsername('');
                onClose();
            } else {
                // Login validation
                if (!email.trim() || !password.trim()) {
                    setError(t('auth.errFieldsRequired'));
                    setLoading(false);
                    return;
                }
                await login(email, password);
                setEmail('');
                setPassword('');
                onClose();
            }
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError(t('auth.errEmailNotFound'));
            } else if (err.code === 'auth/wrong-password') {
                setError(t('auth.errWrongPassword'));
            } else if (err.code === 'auth/email-already-in-use') {
                setError(t('auth.errEmailExists'));
            } else if (err.code === 'auth/invalid-email') {
                setError(t('auth.errInvalidEmail'));
            } else if (err.code === 'auth/invalid-username') {
                setError(t('auth.errInvalidUsername'));
            } else if (err.code === 'auth/username-too-short') {
                setError(t('auth.errUsernameTooShort'));
            } else if (err.code === 'auth/username-already-exists') {
                setError(t('auth.errUsernameExists'));
            } else {
                setError(err.message || t('auth.errGeneric'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setResetSuccess(false);

        if (loading || resetCooldown > 0) return;

        setLoading(true);

        try {
            await resetPassword(resetEmail);
            setResetSuccess(true);
            startResetCooldown(RESET_COOLDOWN_SECONDS);

            setTimeout(() => {
                //setShowForgotPassword(false);
                setResetSuccess(false);
                //setResetEmail('');
            }, 3000);
        } catch (err) {
            console.error('❌ Lỗi reset password:', err);
            setResetSuccess(true);
            startResetCooldown(30);
        } finally {
            setLoading(false);
        }
    };



    const handleOverlayClick = (e) => {
        if (e.target.className === 'login-modal-overlay') {
            onClose();
        }
    };

    const toggleMode = () => {
        setShowRegister(!showRegister);
        setShowForgotPassword(false);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
        setResetEmail('');
        setResetSuccess(false);
    };

    return (
        <div className="login-modal-overlay" onClick={handleOverlayClick}>
            <div className="login-modal-box">
                <button className="modal-close-btn" onClick={onClose}>×</button>

                <div className="modal-header">
                    <h2>🎵 SkyBard</h2>
                    <p className="modal-subtitle">
                        {showForgotPassword ? t('auth.subtitleForgot') : (showRegister ? t('auth.subtitleRegister') : t('auth.subtitleLogin'))}
                    </p>
                </div>

                <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit} className="modal-form">
                    {error && (
                        <div className="modal-error">
                            {error}
                        </div>
                    )}

                    {resetSuccess && (
                        <div className="modal-success">
                            {t('auth.resetEmailSent')}
                        </div>
                    )}

                    {showForgotPassword ? (
                        <>
                            <div className="modal-form-group">
                                <label htmlFor="resetEmail">Email</label>
                                <input
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder={t('auth.emailPlaceholder')}
                                    required
                                    disabled={loading}
                                />
                                <small className="modal-form-hint">{t('auth.hints.email')}</small>
                            </div>

                            <button
                                type="submit"
                                className="modal-btn-auth"
                                disabled={loading || resetCooldown > 0}
                            >
                                {loading
                                    ? t('auth.sendingEmail')
                                    : resetCooldown > 0
                                        ? `${t('auth.retryIn')} ${resetCooldown}s`
                                        : t('auth.sendReset')}
                            </button>


                            <button
                                type="button"
                                className="modal-btn-back"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetEmail('');
                                    setError('');
                                    setResetSuccess(false);
                                }}
                                disabled={loading}
                            >
                                ← {t('auth.backToLogin')}
                            </button>
                        </>
                    ) : showRegister ? (
                        <>
                            <div className="modal-form-group">
                                <label htmlFor="username">{t('auth.username')}</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('auth.usernamePlaceholder')}
                                    required
                                    disabled={loading}
                                    pattern="[a-zA-Z0-9_-]+"
                                    title={t('auth.usernameTitle')}
                                    minLength={3}
                                />
                                <small className="modal-form-hint">{t('auth.hints.username')}</small>
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="email">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="password">{t('auth.password')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                                <small className="modal-form-hint">{t('auth.hints.password')}</small>
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="modal-btn-auth"
                                disabled={loading}
                            >
                                {loading ? t('auth.loading') : t('auth.register')}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="modal-form-group">
                                <label htmlFor="email">{t('auth.accountLabel')}</label>
                                <input
                                    type="text"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.accountPlaceholder')}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="password">{t('auth.password')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="button"
                                className="modal-forgot-password"
                                onClick={() => {
                                    setShowForgotPassword(true);
                                    setError('');
                                }}
                                disabled={loading}
                            >
                                {t('auth.forgotPassword')}
                            </button>

                            <button
                                type="submit"
                                className="modal-btn-auth"
                                disabled={loading}
                            >
                                {loading ? t('auth.loading') : t('auth.login')}
                            </button>

                            <div className="modal-divider">{t('auth.or')}</div>
                            <button
                                type="button"
                                className="modal-btn-google"
                                style={{ opacity: 0.6, width: '100%' }}
                                onClick={() => showAlert(t('auth.googleComingSoon'))}
                            >
                                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {t('auth.loginWithGoogle')}
                            </button>
                        </>
                    )}
                </form>

                {!showForgotPassword && (
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="modal-btn-toggle"
                            onClick={toggleMode}
                            disabled={loading}
                        >
                            {showRegister
                                ? t('auth.hasAccount')
                                : t('auth.noAccount')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}