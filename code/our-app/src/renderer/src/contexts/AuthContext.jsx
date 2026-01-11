import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const login = async (email, password) => {
        // Mock login - không cần xác thực thật
        const mockUser = {
            uid: 'demo-user-' + Date.now(),
            email: email
        };
        const mockProfile = {
            email: email,
            displayName: email.split('@')[0],
            coins: 1000
        };
        setUser(mockUser);
        setUserProfile(mockProfile);
        return mockUser;
    };

    const register = async (email, password) => {
        // Mock register
        return login(email, password);
    };

    const logout = async () => {
        setUser(null);
        setUserProfile(null);
    };

    const refreshUserProfile = async () => {
        // Refresh profile nếu cần
    };

    const value = {
        user,
        userProfile,
        loading: false,
        login,
        register,
        logout,
        refreshUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};