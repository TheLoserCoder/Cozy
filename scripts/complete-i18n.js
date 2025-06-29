#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.ts');

const languages = fs.readdirSync(LOCALES_DIR)
  .filter(file => file.endsWith('.ts') && file !== 'en.ts' && file !== 'index.ts')
  .map(file => file.replace('.ts', ''));

function getKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  const regex = /(['"`])(.*?)\1\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[2]);
  }
  return keys;
}

function getFullStructure(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // This is a simplified parser. It might not work for all edge cases.
    // It assumes a relatively standard object literal structure.
    try {
        const objStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
        // Using Function to parse is safer than eval
        return new Function(`return ${objStr}`)();
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return null;
    }
}

function deepFind(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function deepSet(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

function formatObject(obj, indent = '  ') {
    let result = '{\n';
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            result += `${indent}  ${key}: `;
            if (typeof value === 'string') {
                result += `'${value.replace(/'/g, "\\'")}',\n`;
            } else if (typeof value === 'object' && value !== null) {
                result += formatObject(value, indent + '  ') + ',\n';
            }
        }
    }
    result = result.replace(/,\n$/, '\n');
    result += `${indent}}`;
    return result;
}

function main() {
  console.log('🚀 Starting automated dictionary update...');

  const enStructure = getFullStructure(EN_FILE);
  if (!enStructure) {
      console.error('Could not parse English dictionary. Aborting.');
      return;
  }

  const allEnKeys = getAllKeys(enStructure);

  for (const lang of languages) {
    console.log(`\n📝 Processing ${lang}...`);
    const langFile = path.join(LOCALES_DIR, `${lang}.ts`);
    const langStructure = getFullStructure(langFile);
    if (!langStructure) {
        console.warn(`Could not parse ${lang}.ts, skipping.`);
        continue;
    }

    let updated = false;
    for (const keyPath of allEnKeys) {
        if (!deepFind(langStructure, keyPath)) {
            const enValue = deepFind(enStructure, keyPath);
            console.log(`  - Adding missing key: ${keyPath}`);
            deepSet(langStructure, keyPath, enValue);
            updated = true;
        }
    }

    if (updated) {
        const langName = lang.replace(/-/g, '_');
        const newContent = `// ${lang} translation dictionary\nexport const ${langName} = ${formatObject(langStructure)};\n`;
        fs.writeFileSync(langFile, newContent, 'utf-8');
        console.log(`✅ Updated ${lang}.ts`);
    } else {
        console.log(`✅ ${lang}.ts is already up to date.`);
    }
  }

  console.log('\n🎉 Dictionary update complete!');
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                keys = keys.concat(getAllKeys(obj[key], newPrefix));
            } else {
                keys.push(newPrefix);
            }
        }
    }
    return keys;
}

main();
