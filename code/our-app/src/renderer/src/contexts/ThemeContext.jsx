import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Bước 1: Lấy theme từ localStorage hoặc dùng mặc định
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        return savedTheme || 'dark';  // Mặc định dark theme
    });

    // Bước 2: Áp dụng theme vào document
    useEffect(() => {
        // Lấy root element của app (html tag)
        const root = document.documentElement;
        
        // Xóa class cũ
        root.classList.remove('light', 'dark');
        
        // Thêm class theme hiện tại
        root.classList.add(theme);
        
        // Lưu theme vào localStorage
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    // Bước 3: Function toggle theme
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
