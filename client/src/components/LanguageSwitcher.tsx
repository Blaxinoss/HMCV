// src/components/LanguageSwitcher.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const targetLanguage = i18n.language === 'en'
    ? t('languageSwitcher.arabic')
    : t('languageSwitcher.english');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold text-sm transition"
      title={t('languageSwitcher.switch_to', { language: targetLanguage })}
    >
      {targetLanguage}
    </button>
  );
};

export default LanguageSwitcher;
