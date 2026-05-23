'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem('worklink_language') as Language;
    if (storedLang && ['en', 'hi', 'pa'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('worklink_language', lang);
  };

  const t = (key: string) => {
    // Return translation if exists, otherwise fallback to the key itself
    return translations[language]?.[key] || key;
  };

  // Prevent hydration mismatch by not rendering until mounted if needed, 
  // but to avoid layout shift, we can just render. Mismatch might happen on first load if we use t() in server rendering, 
  // but this is mostly a client-side app.
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
