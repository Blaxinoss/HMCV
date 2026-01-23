// src/components/LanguageSwitcher.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold text-sm transition"
      title={`Switch to ${i18n.language === 'en' ? 'العربية' : 'English'}`}
    >
      {i18n.language === 'en' ? 'العربية' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;
