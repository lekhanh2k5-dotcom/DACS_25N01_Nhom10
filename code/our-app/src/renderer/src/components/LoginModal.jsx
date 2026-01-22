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

    const handleOverlayClick = (e) => {
        if (e.target.className === 'login-modal-overlay') {
            onClose();
        }
    };

    const toggleMode = () => {
        setShowRegister(!showRegister);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
    };

    return (
        <div className="login-modal-overlay" onClick={handleOverlayClick}>
            <div className="login-modal-box">
                <button className="modal-close-btn" onClick={onClose}>×</button>

                <div className="modal-header">
                    <h2>🎵 SkyBard</h2>
                    <p className="modal-subtitle">
                        {showRegister ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && (
                        <div className="modal-error">
                            {error}
                        </div>
                    )}

                    {showRegister ? (
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
                        </>
                    ) : (
                        // ===== ĐĂNG NHẬP FORM =====
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
                        </>
                    )}

                    <button
                        type="submit"
                        className="modal-btn-auth"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : (showRegister ? 'Đăng ký' : 'Đăng nhập')}
                    </button>

                    {!showRegister && (
                        <>
                            <div className="modal-divider">Hoặc</div>
                            <button
                                type="button"
                                className="modal-btn-google"
                                disabled={loading}
                            >
                                Đăng nhập bằng Google
                            </button>
                        </>
                    )}
                </form>

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
            </div>
        </div>
    );
}