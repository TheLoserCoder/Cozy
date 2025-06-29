#!/usr/bin/env node

/**
 * Автоматизированный скрипт для завершения интернационализации
 * Обновляет все языковые словари недостающими ключами из русского словаря
 */

const fs = require('fs');
const path = require('path');

// Пути к файлам
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const RU_FILE = path.join(LOCALES_DIR, 'ru.ts');

// Список языков для обновления
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'cs', name: 'Czech' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

// Переводы для новых ключей
const TRANSLATIONS = {
  // Настройки часов
  clockSettings: {
    en: 'Clock Settings',
    de: 'Uhren-Einstellungen',
    fr: 'Paramètres de l\'horloge',
    es: 'Configuración del reloj',
    it: 'Impostazioni orologio',
    pt: 'Configurações do relógio',
    nl: 'Klok instellingen',
    pl: 'Ustawienia zegara',
    cs: 'Nastavení hodin',
    ja: '時計設定',
    ko: '시계 설정'
  },
  searchSettings: {
    en: 'Search',
    de: 'Suche',
    fr: 'Recherche',
    es: 'Búsqueda',
    it: 'Ricerca',
    pt: 'Pesquisa',
    nl: 'Zoeken',
    pl: 'Wyszukiwanie',
    cs: 'Vyhledávání',
    ja: '検索',
    ko: '검색'
  },
  // Добавить остальные переводы...
};

/**
 * Читает русский словарь и извлекает все ключи
 */
function extractKeysFromRussian() {
  console.log('📖 Читаем русский словарь...');
  
  const ruContent = fs.readFileSync(RU_FILE, 'utf8');
  
  // Простое извлечение ключей из TypeScript файла
  const keys = [];
  const lines = ruContent.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\s*(\w+):\s*['"`](.+?)['"`],?\s*$/);
    if (match) {
      const [, key, value] = match;
      keys.push({ key, value });
    }
  }
  
  console.log(`✅ Найдено ${keys.length} ключей в русском словаре`);
  return keys;
}

/**
 * Обновляет языковой файл недостающими ключами
 */
function updateLanguageFile(langCode, keys) {
  const langFile = path.join(LOCALES_DIR, `${langCode}.ts`);
  
  if (!fs.existsSync(langFile)) {
    console.log(`❌ Файл ${langFile} не найден`);
    return;
  }
  
  console.log(`🔄 Обновляем ${langCode}.ts...`);
  
  let content = fs.readFileSync(langFile, 'utf8');
  
  // Найти место для вставки новых ключей (перед закрывающей скобкой settings)
  const settingsEndMatch = content.match(/(\s+)}\s*,\s*\/\/\s*Lists/);
  if (!settingsEndMatch) {
    console.log(`❌ Не удалось найти место для вставки в ${langCode}.ts`);
    return;
  }
  
  const indent = settingsEndMatch[1];
  let newKeys = [];
  
  // Добавляем недостающие ключи
  for (const { key } of keys) {
    if (!content.includes(`${key}:`)) {
      const translation = TRANSLATIONS[key] && TRANSLATIONS[key][langCode] 
        ? TRANSLATIONS[key][langCode] 
        : `[${key}]`; // Заглушка если перевода нет
      
      newKeys.push(`${indent}${key}: '${translation}',`);
    }
  }
  
  if (newKeys.length > 0) {
    // Вставляем новые ключи перед закрывающей скобкой
    const insertPosition = content.indexOf(settingsEndMatch[0]);
    const newContent = content.slice(0, insertPosition) + 
                      newKeys.join('\n') + '\n' + 
                      content.slice(insertPosition);
    
    fs.writeFileSync(langFile, newContent, 'utf8');
    console.log(`✅ Добавлено ${newKeys.length} ключей в ${langCode}.ts`);
  } else {
    console.log(`✅ ${langCode}.ts уже актуален`);
  }
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Запуск автоматизированного обновления словарей...\n');
  
  try {
    // Извлекаем ключи из русского словаря
    const keys = extractKeysFromRussian();
    
    // Обновляем каждый языковой файл
    for (const { code, name } of LANGUAGES) {
      console.log(`\n📝 Обрабатываем ${name} (${code})...`);
      updateLanguageFile(code, keys);
    }
    
    console.log('\n🎉 Обновление словарей завершено!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте обновленные файлы');
    console.log('2. Замените русские тексты в компонентах на t() функции');
    console.log('3. Протестируйте переключение языков');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { main, extractKeysFromRussian, updateLanguageFile };
