import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                if (password.length < 6) {
                    setError('Mật khẩu phải có ít nhất 6 ký tự');
                    setLoading(false);
                    return;
                }
                await register(email, password);
                alert('✅ Đăng ký thành công! Bạn đã nhận 1000 xu');
                onClose();
            } else {
                await login(email, password);
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
                            ⚠️ {error}
                        </div>
                    )}

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
                        {showRegister && (
                            <small className="modal-form-hint">Tối thiểu 6 ký tự</small>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="modal-btn-auth"
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang xử lý...' : (showRegister ? '📝 Đăng ký' : '🔐 Đăng nhập')}
                    </button>
                </form>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="modal-btn-toggle"
                        onClick={() => {
                            setShowRegister(!showRegister);
                            setError('');
                        }}
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