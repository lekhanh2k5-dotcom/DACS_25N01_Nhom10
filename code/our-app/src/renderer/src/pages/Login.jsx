import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        account: '',
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.account || !formData.password) {
            setError('Vui lòng nhập tài khoản và mật khẩu');
            setLoading(false);
            return;
        }

        try {
            // TODO: Integrate with Firebase authentication
            console.log('Đăng nhập:', formData.account);
            // await login(formData.account, formData.password);
            alert('Đăng nhập thành công!');
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            // TODO: Integrate with Google Sign-In
            console.log('Đăng nhập bằng Google');
            alert('Đăng nhập Google thành công!');
        } catch (err) {
            setError(err.message || 'Đăng nhập Google thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ tất cả các trường');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        try {
            // TODO: Integrate with Firebase authentication
            console.log('Đăng kí:', formData.username, formData.email);
            // await register(formData.email, formData.password, formData.username);
            alert('Đăng kí thành công!');
            setIsLogin(true);
            setFormData({ account: '', email: '', password: '', confirmPassword: '', username: '' });
        } catch (err) {
            setError(err.message || 'Đăng kí thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>SkyBard</h1>

                {isLogin ? (
                    // FORM ĐĂNG NHẬP
                    <form onSubmit={handleLogin} className="login-form">
                        <h2>Đăng Nhập</h2>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="account">Tài khoản (Email hoặc Tên tk)</label>
                            <input
                                type="text"
                                id="account"
                                name="account"
                                value={formData.account}
                                onChange={handleInputChange}
                                placeholder="Nhập email hoặc tên tài khoản"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </button>

                        <div className="divider">Hoặc</div>

                        <button 
                            type="button" 
                            className="btn-google"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                            Đăng nhập bằng Google
                        </button>

                        <p className="toggle-form">
                            Chưa có tài khoản? <button type="button" onClick={() => {
                                setIsLogin(false);
                                setError('');
                                setFormData({ account: '', email: '', password: '', confirmPassword: '', username: '' });
                            }}>Đăng kí</button>
                        </p>
                    </form>
                ) : (
                    // FORM ĐĂNG KÍ
                    <form onSubmit={handleRegister} className="login-form">
                        <h2>Đăng Kí</h2>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="username">Tên tài khoản</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập tên tài khoản"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Nhập lại mật khẩu"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang đăng kí...' : 'Đăng Kí'}
                        </button>

                        <p className="toggle-form">
                            Đã có tài khoản? <button type="button" onClick={() => {
                                setIsLogin(true);
                                setError('');
                                setFormData({ account: '', email: '', password: '', confirmPassword: '', username: '' });
                            }}>Đăng nhập</button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
