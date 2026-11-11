import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, LanguageOption, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  currentLanguageOption: LanguageOption;
  setLanguage: (lang: LanguageCode) => void;
  languages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'apex_tesla_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const isRTL = currentLanguageOption.dir === 'rtl';

  const setLanguage = (lang: LanguageCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === lang)) {
      setCurrentLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // LocalStorage fallback
      }
      // Update HTML lang and dir attribute
      document.documentElement.lang = lang;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage, isRTL]);

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[currentLanguage];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English translation
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLanguageOption,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
