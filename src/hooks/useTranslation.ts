
"use client";

import { useContext } from 'react';
import { LanguageContext } from '@/context/LanguageContext';

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }

    const { translations, setLanguage, language } = context;

    // A simple 't' function to get nested keys from the JSON file
    const t = (key: string): string => {
        return key.split('.').reduce((obj: any, k: string) => {
            return obj?.[k];
        }, translations) || key;
    };

    return { t, setLanguage, language };
};
