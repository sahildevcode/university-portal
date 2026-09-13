import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('pkc_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pkc_lang', lang);
    } catch (e) {
      console.error('Error saving language preference:', e);
    }
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const isHindi = lang === 'hi';
  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, isHindi, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLang: () => {},
      isHindi: false,
      t: translations.en
    };
  }
  return context;
}
