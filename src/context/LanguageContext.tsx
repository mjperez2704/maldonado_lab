
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

type Locale = 'es' | 'en';

type Translations = typeof es;

interface LanguageContextType {
    language: Locale;
    setLanguage: (language: Locale) => void;
    translations: Translations;
}

const translations = { es, en };

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Locale>('es');

    useEffect(() => {
        // Here you could load the initial language from localStorage or user settings
    }, []);

    const value = {
        language,
        setLanguage,
        translations: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
