import { ru, TranslationKeys } from './ru';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';
import { it } from './it';
import { pt } from './pt';
import { nl } from './nl';
import { pl } from './pl';
import { cs } from './cs';
import { ja } from './ja';
import { ko } from './ko';
import { uk } from './uk';
import { zh } from './zh';
import { vi } from './vi';
import { hi } from './hi';
import { ar } from './ar';
import { tr } from './tr';

// Доступные языки
export const availableLanguages = {
  ru: 'Русский',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  cs: 'Čeština',
  ja: '日本語',
  ko: '한국어',
  uk: 'Українська',
  zh: '中文',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  ar: 'العربية',
  tr: 'Türkçe',
} as const;

export type LanguageCode = keyof typeof availableLanguages;

// Словари переводов
const translations: Record<LanguageCode, TranslationKeys> = {
  ru,
  en: en as TranslationKeys,
  de: de as TranslationKeys,
  fr: fr as TranslationKeys,
  es: es as TranslationKeys,
  it: it as TranslationKeys,
  pt: pt as TranslationKeys,
  nl: nl as TranslationKeys,
  pl: pl as TranslationKeys,
  cs: cs as TranslationKeys,
  ja: ja as TranslationKeys,
  ko: ko as TranslationKeys,
  uk: uk as TranslationKeys,
  zh: zh as TranslationKeys,
  vi: vi as TranslationKeys,
  hi: hi as TranslationKeys,
  ar: ar as TranslationKeys,
  tr: tr as TranslationKeys,
};

// Текущий язык (по умолчанию русский)
let currentLanguage: LanguageCode = 'ru';

// Функция для установки языка (используется только внутри системы переводов)
const setCurrentLanguage = (language: LanguageCode) => {
  currentLanguage = language;
};

// Функция для получения текущего языка
export const getCurrentLanguage = (): LanguageCode => {
  return currentLanguage;
};

// Функция для получения перевода по ключу
export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[getCurrentLanguage()];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Если перевод не найден, возвращаем ключ
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// Хук для использования переводов в React компонентах

export const useTranslation = () => {
  // Функция t, которая будет получать текущий язык из Redux через getCurrentLanguage
  const tWithRedux = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[getCurrentLanguage()];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Если перевод не найден, возвращаем ключ
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return {
    t: tWithRedux,
    availableLanguages,
  };
};

// Функция для синхронизации языка из Redux
export const syncLanguageFromRedux = (language: LanguageCode) => {
  setCurrentLanguage(language);
};

// Функция для локализованных alert (читает язык напрямую из localStorage)
export const localizedAlert = (key: string): void => {
  try {
    // Читаем язык напрямую из localStorage
    const persistedState = localStorage.getItem('persist:root');
    let language: LanguageCode = 'en'; // по умолчанию английский

    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      if (parsed.theme) {
        const themeState = JSON.parse(parsed.theme);
        if (themeState.language && themeState.language in availableLanguages) {
          language = themeState.language as LanguageCode;
        }
      }
    }

    // Получаем перевод для указанного языка
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If translation not found, use key
        console.warn(`Translation not found for key: ${key} in language: ${language}`);
        value = key;
        break;
      }
    }

    const message = typeof value === 'string' ? value : key;
    alert(message);
  } catch (error) {
    console.error('Error in localizedAlert:', error);
    alert(key); // fallback to key
  }
};

// Экспортируем основные функции
export default translations;
