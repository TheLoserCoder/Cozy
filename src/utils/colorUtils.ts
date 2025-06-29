// Утилиты для работы с цветами

/**
 * Конвертирует HEX цвет в HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Убираем # если есть
  hex = hex.replace('#', '');
  
  // Конвертируем в RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Конвертирует HSL в HEX цвет
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Определяет, является ли цвет светлым (яркость > 50%)
 */
export function isLightColor(hex: string): boolean {
  const { l } = hexToHsl(hex);
  return l > 50;
}

/**
 * Создает производный цвет для ссылок на основе акцентного цвета
 * Для светлых цветов - делает темнее и насыщеннее
 * Для темных цветов - делает светлее и насыщеннее
 */
export function createLinkColorFromAccent(accentColor: string): string {
  const { h, s, l } = hexToHsl(accentColor);
  
  let newS = s;
  let newL = l;
  
  if (isLightColor(accentColor)) {
    // Для светлых цветов - делаем темнее и насыщеннее
    newS = Math.min(100, s + 20); // Увеличиваем насыщенность
    newL = Math.max(20, l - 30);  // Уменьшаем яркость (делаем темнее)
  } else {
    // Для темных цветов - делаем светлее и насыщеннее
    newS = Math.min(100, s + 15); // Увеличиваем насыщенность
    newL = Math.min(80, l + 25);  // Увеличиваем яркость (делаем светлее)
  }
  
  return hslToHex(h, newS, newL);
}

/**
 * Создает цвет для быстрых ссылок на основе акцентного цвета
 * Более мягкий вариант чем для обычных ссылок
 */
export function createFastLinkColorFromAccent(accentColor: string): string {
  const { h, s, l } = hexToHsl(accentColor);
  
  let newS = s;
  let newL = l;
  
  if (isLightColor(accentColor)) {
    // Для светлых цветов - делаем немного темнее
    newS = Math.min(100, s + 10);
    newL = Math.max(30, l - 20);
  } else {
    // Для темных цветов - делаем немного светлее
    newS = Math.min(100, s + 10);
    newL = Math.min(70, l + 20);
  }
  
  return hslToHex(h, newS, newL);
}

/**
 * Проверяет, является ли строка валидным HEX цветом
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}
