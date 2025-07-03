import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../node_modules/bootstrap-icons/icons');
const targetFile = path.join(__dirname, '../public/bootstrap-icons-data.json');

// Читаем все SVG файлы и создаем JSON с данными
const files = fs.readdirSync(sourceDir);
const svgFiles = files.filter(file => file.endsWith('.svg'));

console.log(`Processing ${svgFiles.length} Bootstrap icons...`);

const iconsData = {};

// Обрабатываем ВСЕ иконки
svgFiles.forEach(file => {
  const iconName = file.replace('.svg', '');
  const filePath = path.join(sourceDir, file);
  const svgContent = fs.readFileSync(filePath, 'utf8');
  iconsData[iconName] = svgContent;
});

// Создаем JSON файл
fs.writeFileSync(targetFile, JSON.stringify(iconsData, null, 2));

console.log(`Generated bootstrap-icons-data.json with ${Object.keys(iconsData).length} icons`);

// Создаем список всех иконок
const allIconsList = Object.keys(iconsData);
const allIconsFile = path.join(__dirname, '../public/bootstrap-icons-list.json');
fs.writeFileSync(allIconsFile, JSON.stringify(allIconsList, null, 2));

console.log(`Generated bootstrap-icons-list.json with ${allIconsList.length} icon names`);