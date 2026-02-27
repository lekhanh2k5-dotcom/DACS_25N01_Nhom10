import { createContext, useContext, useState, useEffect } from 'react';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const LanguageContext = createContext();

const translations = {
    vi,
    en
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        try {
            const saved = localStorage.getItem('appLanguage');
            if (saved && ['vi', 'en'].includes(saved)) return saved;
        } catch (e) { /* ignore */ }
        return 'vi';
    });

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

    // Template function: replaces {name}, {price} etc. with provided params
    const tf = (key, params = {}) => {
        let str = t(key);
        Object.entries(params).forEach(([k, v]) => {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
        return str;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t, tf }}>
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
