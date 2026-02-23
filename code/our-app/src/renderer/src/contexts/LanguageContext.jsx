import { createContext, useContext, useState, useEffect } from 'react';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const LanguageContext = createContext();

const translations = {
    vi,
    en
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('vi');

    // Load language from localStorage on mount
    useEffect(() => {
        try {
            const savedLanguage = localStorage.getItem('appLanguage');
            if (savedLanguage && ['vi', 'en'].includes(savedLanguage)) {
                setLanguage(savedLanguage);
            }
        } catch (e) {
            console.error('Error loading language preference:', e);
        }
    }, []);

    // Save language to localStorage when changed
    useEffect(() => {
        try {
            localStorage.setItem('appLanguage', language);
            // Optionally set HTML lang attribute
            document.documentElement.lang = language;
        } catch (e) {
            console.error('Error saving language preference:', e);
        }
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
