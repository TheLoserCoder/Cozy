// Утилиты для анализа цветов изображения и создания гармоничной палитры

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorPalette {
  accent: string;
  links: string;
  clock: string;
  listBackground: string;
  listTitle: string;
}

export enum ColorAnalysisMode {
  HARMONIOUS = 'harmonious',           // Гармоничные цвета
  CONTRASTING = 'contrasting',         // Контрастные цвета
  VIBRANT = 'vibrant',                 // Яркие насыщенные цвета
  MUTED = 'muted',                     // Приглушенные цвета
  WARM = 'warm',                       // Теплые оттенки
  COOL = 'cool',                       // Холодные оттенки
  MONOCHROME = 'monochrome',           // Монохромные (разные яркости одного цвета)
  COMPLEMENTARY = 'complementary'      // Комплементарные с вариациями фона и часов
}

interface CachedColorAnalysis {
  imageUrl: string;
  dominantColors: RGB[];
  palettes: ColorPalette[];
  timestamp: number;
}

// Конвертация RGB в HSL
function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Конвертация HSL в RGB
function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Конвертация RGB в hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Функция для анализа изображения из canvas
function analyzeImageFromCanvas(img: HTMLImageElement): RGB[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }

  // Уменьшаем размер для быстрого анализа
  const size = 100;
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(img, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // Собираем цвета с шагом для оптимизации
  const colors: RGB[] = [];
  for (let i = 0; i < data.length; i += 16) { // каждый 4-й пиксель
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];

    // Пропускаем прозрачные и слишком темные/светлые пиксели
    if (alpha > 128 && (r + g + b) > 50 && (r + g + b) < 700) {
      colors.push({ r, g, b });
    }
  }

  // Группируем похожие цвета и находим доминантные
  return findDominantColors(colors, 5);
}

// Попытка загрузить изображение напрямую
function loadImageDirect(imageUrl: string): Promise<RGB[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const colors = analyzeImageFromCanvas(img);
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image directly'));
    img.src = imageUrl;
  });
}

// Загрузка изображения через публичный CORS прокси
async function loadImageViaFetch(imageUrl: string): Promise<RGB[]> {
  const corsProxies = [
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];

  for (const proxy of corsProxies) {
    try {
      console.log(`Trying CORS proxy: ${proxy}`);

      const proxyUrl = proxy + encodeURIComponent(imageUrl);
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Proxy failed with status: ${response.status}`);
      }

      const blob = await response.blob();

      // Проверяем, что это действительно изображение
      if (!blob.type.startsWith('image/')) {
        throw new Error('Response is not an image');
      }

      // Создаем URL для blob
      const blobUrl = URL.createObjectURL(blob);

      return new Promise<RGB[]>((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          try {
            const colors = analyzeImageFromCanvas(img);
            URL.revokeObjectURL(blobUrl);
            resolve(colors);
          } catch (error) {
            URL.revokeObjectURL(blobUrl);
            reject(error);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Failed to load image from blob'));
        };

        // Загружаем из blob (это должно работать без CORS проблем)
        img.src = blobUrl;
      });

    } catch (error) {
      console.log(`Proxy ${proxy} failed:`, error);
      continue; // Пробуем следующий прокси
    }
  }

  throw new Error('All CORS proxies failed');
}



// Простая загрузка изображения без crossOrigin (последняя попытка)
async function loadImageWithoutCORS(imageUrl: string): Promise<RGB[]> {
  console.log('Trying to load image without CORS restrictions...');

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Пробуем анализировать без crossOrigin
        // Это может работать для некоторых изображений
        const colors = analyzeImageFromCanvas(img);
        resolve(colors);
      } catch (error) {
        reject(new Error(`Canvas analysis failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image without CORS'));
    };

    // Загружаем без crossOrigin
    img.src = imageUrl;
  });
}

// Получение доминантных цветов из изображения с обходом CORS
export async function extractDominantColors(imageUrl: string): Promise<RGB[]> {
  console.log('Starting image analysis for:', imageUrl);

  // Метод 1: Прямая загрузка с crossOrigin
  try {
    console.log('Method 1: Direct loading with crossOrigin...');
    return await loadImageDirect(imageUrl);
  } catch (directError) {
    console.log('Method 1 failed:', directError);
  }

  // Метод 2: CORS прокси
  try {
    console.log('Method 2: CORS proxy...');
    return await loadImageViaFetch(imageUrl);
  } catch (fetchError) {
    console.log('Method 2 failed:', fetchError);
  }

  // Метод 3: Загрузка без CORS (последняя попытка)
  try {
    console.log('Method 3: Loading without CORS...');
    return await loadImageWithoutCORS(imageUrl);
  } catch (noCorsError) {
    console.log('Method 3 failed:', noCorsError);
  }

  // Если все методы не сработали, возвращаем пустой массив
  console.warn('All image loading methods failed, using fallback palette');
  return [];
}

// Находим доминантные цвета методом кластеризации
function findDominantColors(colors: RGB[], count: number): RGB[] {
  if (colors.length === 0) return [];
  
  // Простая кластеризация по цветовому расстоянию
  const clusters: RGB[][] = [];
  
  for (const color of colors) {
    let addedToCluster = false;
    
    for (const cluster of clusters) {
      const representative = cluster[0];
      const distance = colorDistance(color, representative);
      
      if (distance < 50) { // порог схожести
        cluster.push(color);
        addedToCluster = true;
        break;
      }
    }
    
    if (!addedToCluster) {
      clusters.push([color]);
    }
  }
  
  // Сортируем кластеры по размеру и берем самые большие
  clusters.sort((a, b) => b.length - a.length);
  
  return clusters.slice(0, count).map(cluster => {
    // Возвращаем средний цвет кластера
    const avgR = Math.round(cluster.reduce((sum, c) => sum + c.r, 0) / cluster.length);
    const avgG = Math.round(cluster.reduce((sum, c) => sum + c.g, 0) / cluster.length);
    const avgB = Math.round(cluster.reduce((sum, c) => sum + c.b, 0) / cluster.length);
    return { r: avgR, g: avgG, b: avgB };
  });
}

// Расстояние между цветами в RGB пространстве
function colorDistance(c1: RGB, c2: RGB): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Вспомогательные функции для разных режимов
function selectAccentByMode(hslColors: HSL[], mode: ColorAnalysisMode): HSL {
  switch (mode) {
    case ColorAnalysisMode.HARMONIOUS:
      // Самый насыщенный, но не слишком яркий
      return hslColors.reduce((prev, curr) =>
        (curr.s > prev.s && curr.l > 30 && curr.l < 70) ? curr : prev
      );

    case ColorAnalysisMode.CONTRASTING:
      // Самый контрастный к среднему тону
      const avgLightness = hslColors.reduce((sum, hsl) => sum + hsl.l, 0) / hslColors.length;
      return hslColors.reduce((prev, curr) =>
        Math.abs(curr.l - avgLightness) > Math.abs(prev.l - avgLightness) ? curr : prev
      );

    case ColorAnalysisMode.VIBRANT:
      // Самый яркий и насыщенный
      return hslColors.reduce((prev, curr) =>
        (curr.s + curr.l) > (prev.s + prev.l) ? curr : prev
      );

    case ColorAnalysisMode.MUTED:
      // Менее насыщенный, спокойный
      return hslColors.reduce((prev, curr) =>
        (curr.s < prev.s && curr.l > 40 && curr.l < 60) ? curr : prev
      );

    case ColorAnalysisMode.WARM:
      // Теплые оттенки (красный, оранжевый, желтый)
      return hslColors.reduce((prev, curr) => {
        const isWarm = (curr.h >= 0 && curr.h <= 60) || (curr.h >= 300 && curr.h <= 360);
        const prevIsWarm = (prev.h >= 0 && prev.h <= 60) || (prev.h >= 300 && prev.h <= 360);
        if (isWarm && !prevIsWarm) return curr;
        if (isWarm && prevIsWarm) return curr.s > prev.s ? curr : prev;
        return prev;
      });

    case ColorAnalysisMode.COOL:
      // Холодные оттенки (синий, зеленый, фиолетовый)
      return hslColors.reduce((prev, curr) => {
        const isCool = curr.h >= 120 && curr.h <= 300;
        const prevIsCool = prev.h >= 120 && prev.h <= 300;
        if (isCool && !prevIsCool) return curr;
        if (isCool && prevIsCool) return curr.s > prev.s ? curr : prev;
        return prev;
      });

    case ColorAnalysisMode.MONOCHROME:
      // Самый насыщенный для монохромной схемы
      return hslColors.reduce((prev, curr) => curr.s > prev.s ? curr : prev);

    case ColorAnalysisMode.COMPLEMENTARY:
      // Средний по насыщенности для комплементарной схемы
      return hslColors.reduce((prev, curr) =>
        (curr.s > 40 && curr.s < 80 && curr.l > 35 && curr.l < 65) ? curr : prev
      );

    default:
      return hslColors[0];
  }
}

function adjustAccentByMode(accentHsl: HSL, mode: ColorAnalysisMode): HSL {
  const adjusted = { ...accentHsl };

  switch (mode) {
    case ColorAnalysisMode.HARMONIOUS:
      adjusted.s = Math.min(75, adjusted.s + 15);
      adjusted.l = Math.max(35, Math.min(65, adjusted.l));
      break;

    case ColorAnalysisMode.CONTRASTING:
      adjusted.s = Math.min(90, adjusted.s + 25);
      adjusted.l = adjusted.l > 50 ? Math.max(20, adjusted.l - 30) : Math.min(80, adjusted.l + 30);
      break;

    case ColorAnalysisMode.VIBRANT:
      adjusted.s = Math.min(95, adjusted.s + 30);
      adjusted.l = Math.max(45, Math.min(75, adjusted.l + 10));
      break;

    case ColorAnalysisMode.MUTED:
      adjusted.s = Math.max(30, adjusted.s - 20);
      adjusted.l = Math.max(40, Math.min(60, adjusted.l));
      break;

    case ColorAnalysisMode.WARM:
      adjusted.s = Math.min(85, adjusted.s + 20);
      adjusted.l = Math.max(40, Math.min(70, adjusted.l + 5));
      // Сдвигаем к теплым тонам если нужно
      if (adjusted.h > 60 && adjusted.h < 300) {
        adjusted.h = adjusted.h < 180 ? 45 : 330;
      }
      break;

    case ColorAnalysisMode.COOL:
      adjusted.s = Math.min(80, adjusted.s + 15);
      adjusted.l = Math.max(35, Math.min(65, adjusted.l));
      // Сдвигаем к холодным тонам если нужно
      if (adjusted.h < 120 || adjusted.h > 300) {
        adjusted.h = adjusted.h < 60 ? 210 : 240;
      }
      break;

    case ColorAnalysisMode.MONOCHROME:
      adjusted.s = Math.min(70, adjusted.s + 10);
      adjusted.l = Math.max(40, Math.min(60, adjusted.l));
      break;

    case ColorAnalysisMode.COMPLEMENTARY:
      adjusted.s = Math.min(85, adjusted.s + 20);
      adjusted.l = Math.max(35, Math.min(65, adjusted.l));
      break;
  }

  return adjusted;
}

// Создание палитры на основе доминантных цветов с разными режимами
export function createColorPalette(dominantColors: RGB[], mode: ColorAnalysisMode, hasBackdropBlur: boolean = false): ColorPalette {
  if (dominantColors.length === 0) {
    // Fallback палитра
    return {
      accent: '#3E63DD',
      links: '#1E40AF',
      clock: '#FFFFFF',
      listBackground: hasBackdropBlur ? 'rgba(255, 255, 255, 0.1)' : '#F8F9FA',
      listTitle: '#1F2937'
    };
  }

  // Конвертируем в HSL для лучшей работы с цветами
  const hslColors = dominantColors.map(rgb => rgbToHsl(rgb.r, rgb.g, rgb.b));

  // Выбираем акцентный цвет в зависимости от режима
  const baseAccentHsl = selectAccentByMode(hslColors, mode);

  // Корректируем акцентный цвет в зависимости от режима
  const accentHsl = adjustAccentByMode(baseAccentHsl, mode);
  
  // Создаем цвет ссылок в зависимости от режима
  const linksHsl = { ...accentHsl };
  switch (mode) {
    case ColorAnalysisMode.HARMONIOUS:
      linksHsl.h = (linksHsl.h + 30) % 360; // аналогичный цвет
      linksHsl.l = Math.max(25, linksHsl.l - 15);
      break;
    case ColorAnalysisMode.CONTRASTING:
      linksHsl.h = (linksHsl.h + 180) % 360; // комплементарный цвет
      linksHsl.l = Math.max(30, linksHsl.l - 10);
      break;
    case ColorAnalysisMode.VIBRANT:
      linksHsl.h = (linksHsl.h + 60) % 360; // триадный цвет
      linksHsl.s = Math.min(90, linksHsl.s + 10);
      linksHsl.l = Math.max(35, linksHsl.l - 20);
      break;
    case ColorAnalysisMode.MUTED:
      linksHsl.h = (linksHsl.h + 45) % 360; // близкий аналогичный
      linksHsl.s = Math.max(20, linksHsl.s - 15);
      linksHsl.l = Math.max(30, linksHsl.l - 10);
      break;
    case ColorAnalysisMode.WARM:
      linksHsl.h = (linksHsl.h + 20) % 360; // близкий теплый
      linksHsl.l = Math.max(30, linksHsl.l - 15);
      break;
    case ColorAnalysisMode.COOL:
      linksHsl.h = (linksHsl.h + 40) % 360; // близкий холодный
      linksHsl.l = Math.max(25, linksHsl.l - 20);
      break;
    case ColorAnalysisMode.MONOCHROME:
      // Тот же оттенок, но темнее
      linksHsl.l = Math.max(20, linksHsl.l - 25);
      linksHsl.s = Math.max(40, linksHsl.s - 10);
      break;
    case ColorAnalysisMode.COMPLEMENTARY:
      linksHsl.h = (linksHsl.h + 150) % 360; // почти комплементарный
      linksHsl.l = Math.max(25, linksHsl.l - 15);
      break;
  }
  
  // Цвет часов - контрастный к общему тону изображения
  const avgLightness = hslColors.reduce((sum, hsl) => sum + hsl.l, 0) / hslColors.length;
  const clockColor = avgLightness > 50 ? '#000000' : '#FFFFFF';
  
  // Цвет заголовков списков - на основе акцента, но темнее
  const titleHsl = { ...accentHsl };
  titleHsl.l = Math.max(20, titleHsl.l - 25);
  titleHsl.s = Math.max(40, titleHsl.s - 10);
  
  // Фон списков - зависит от настройки размытия
  const backgroundHsl = { ...accentHsl };
  backgroundHsl.l = 95;
  backgroundHsl.s = Math.min(20, backgroundHsl.s);

  const accentRgb = hslToRgb(accentHsl.h, accentHsl.s, accentHsl.l);
  const linksRgb = hslToRgb(linksHsl.h, linksHsl.s, linksHsl.l);
  const titleRgb = hslToRgb(titleHsl.h, titleHsl.s, titleHsl.l);
  const backgroundRgb = hslToRgb(backgroundHsl.h, backgroundHsl.s, backgroundHsl.l);

  // Если размытие включено - используем прозрачность, иначе - сплошной цвет
  const listBackground = hasBackdropBlur
    ? `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.15)`
    : rgbToHex(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);

  return {
    accent: rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b),
    links: rgbToHex(linksRgb.r, linksRgb.g, linksRgb.b),
    clock: clockColor,
    listBackground: listBackground,
    listTitle: rgbToHex(titleRgb.r, titleRgb.g, titleRgb.b)
  };
}

// Ключ для localStorage
const CACHE_KEY = 'colorAnalysisCache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 часа

// Сохранение анализа в localStorage
function saveCachedAnalysis(analysis: CachedColorAnalysis): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(analysis));
  } catch (error) {
    console.warn('Failed to save color analysis to localStorage:', error);
  }
}

// Загрузка анализа из localStorage
function loadCachedAnalysis(imageUrl: string): CachedColorAnalysis | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const analysis: CachedColorAnalysis = JSON.parse(cached);

    // Проверяем, что это тот же URL и кэш не устарел
    if (analysis.imageUrl === imageUrl &&
        Date.now() - analysis.timestamp < CACHE_EXPIRY) {
      return analysis;
    }

    return null;
  } catch (error) {
    console.warn('Failed to load color analysis from localStorage:', error);
    return null;
  }
}

// Создание всех 8 палитр за один раз
export function createAllColorPalettes(dominantColors: RGB[], hasBackdropBlur: boolean = false): ColorPalette[] {
  const modes = [
    ColorAnalysisMode.HARMONIOUS,
    ColorAnalysisMode.CONTRASTING,
    ColorAnalysisMode.VIBRANT,
    ColorAnalysisMode.MUTED,
    ColorAnalysisMode.WARM,
    ColorAnalysisMode.COOL,
    ColorAnalysisMode.MONOCHROME,
    ColorAnalysisMode.COMPLEMENTARY
  ];

  return modes.map(mode => createColorPalette(dominantColors, mode, hasBackdropBlur));
}

// Главная функция для получения всех палитр с кэшированием
export async function getColorPalettes(imageUrl: string, hasBackdropBlur: boolean = false): Promise<ColorPalette[]> {
  // Проверяем кэш
  const cached = loadCachedAnalysis(imageUrl);
  if (cached) {
    console.log('Using cached color analysis for:', imageUrl);
    // Пересоздаем палитры с учетом текущих настроек размытия
    return createAllColorPalettes(cached.dominantColors, hasBackdropBlur);
  }

  console.log('Analyzing new image:', imageUrl);

  // Анализируем изображение
  const dominantColors = await extractDominantColors(imageUrl);

  // Создаем все палитры
  const palettes = createAllColorPalettes(dominantColors, hasBackdropBlur);

  // Сохраняем в кэш
  const analysis: CachedColorAnalysis = {
    imageUrl,
    dominantColors,
    palettes,
    timestamp: Date.now()
  };
  saveCachedAnalysis(analysis);

  return palettes;
}
