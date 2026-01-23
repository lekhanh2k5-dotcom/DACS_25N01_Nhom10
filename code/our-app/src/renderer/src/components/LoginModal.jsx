import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (showRegister) {
                // Validate registration form
                if (!username.trim()) {
                    setError('Vui lòng nhập tên tài khoản');
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError('Mật khẩu phải có ít nhất 6 ký tự');
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Mật khẩu không khớp');
                    setLoading(false);
                    return;
                }
                await register(email, password);
                alert('Đăng ký thành công! Bạn đã nhận 1000 xu');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setUsername('');
                onClose();
            } else {
                // Login validation
                if (!email.trim() || !password.trim()) {
                    setError('Vui lòng nhập tài khoản và mật khẩu');
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
                setError('Email không tồn tại');
            } else if (err.code === 'auth/wrong-password') {
                setError('Mật khẩu không đúng');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email đã được sử dụng');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email không hợp lệ');
            } else {
                setError(err.message || 'Đã xảy ra lỗi');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Gửi email reset cho:', resetEmail);
            setResetSuccess(true);
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetSuccess(false);
                setResetEmail('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Không thể gửi email reset');
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
                        {showForgotPassword ? 'Khôi phục mật khẩu' : (showRegister ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục')}
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
                            ✓ Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư.
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
                                    placeholder="Nhập email của bạn"
                                    required
                                    disabled={loading}
                                />
                                <small className="modal-form-hint">Chúng tôi sẽ gửi link khôi phục đến email này</small>
                            </div>

                            <button
                                type="submit"
                                className="modal-btn-auth"
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
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
                                ← Quay lại đăng nhập
                            </button>
                        </>
                    ) : showRegister ? (
                        // ===== ĐĂNG KÝ FORM =====
                        <>
                            <div className="modal-form-group">
                                <label htmlFor="username">Tên tài khoản</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên tài khoản"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="email">Email</label>
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
                                <label htmlFor="password">Mật khẩu</label>
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
                                <small className="modal-form-hint">Tối thiểu 6 ký tự</small>
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
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
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="modal-form-group">
                                <label htmlFor="email">Tài khoản (Email hoặc tên tk)</label>
                                <input
                                    type="text"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email hoặc tên tài khoản"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="password">Mật khẩu</label>
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
                                Quên mật khẩu?
                            </button>

                            <button
                                type="submit"
                                className="modal-btn-auth"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>

                            <div className="modal-divider">Hoặc</div>
                            <button
                                type="button"
                                className="modal-btn-google"
                                disabled={loading}
                            >
                                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Đăng nhập bằng Google
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
                                ? 'Đã có tài khoản? Đăng nhập ngay'
                                : 'Chưa có tài khoản? Đăng ký ngay'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}