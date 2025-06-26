/**
 * Извлекает домен из URL и формирует ссылку на favicon
 */
export function getFaviconUrl(url: string): string {
  try {
    // Создаем объект URL для парсинга
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Используем несколько вариантов получения favicon для лучшей совместимости
    const faviconOptions = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
      `https://${domain}/apple-touch-icon.png`
    ];
    
    // Возвращаем первый вариант (Google Favicon API) как наиболее надежный
    return faviconOptions[0];
  } catch (error) {
    // Если URL невалидный, возвращаем дефолтную иконку
    console.warn('Invalid URL for favicon extraction:', url);
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
  }
}

/**
 * Проверяет доступность favicon по URL
 */
export async function checkFaviconAvailability(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Получает лучший доступный favicon для домена
 */
export async function getBestFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    const faviconOptions = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
      `https://${domain}/apple-touch-icon.png`
    ];
    
    // Проверяем доступность каждого варианта
    for (const faviconUrl of faviconOptions) {
      const isAvailable = await checkFaviconAvailability(faviconUrl);
      if (isAvailable) {
        return faviconUrl;
      }
    }
    
    // Если ничего не найдено, возвращаем Google Favicon API
    return faviconOptions[0];
  } catch (error) {
    console.warn('Error getting best favicon URL:', error);
    return getFaviconUrl(url);
  }
}
