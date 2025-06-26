/**
 * Проверяет, является ли URL ссылкой на изображение по расширению
 */
export function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    // Список поддерживаемых расширений изображений
    const imageExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'
    ];
    
    return imageExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Проверяет, является ли URL валидным и доступным изображением
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // Сначала проверяем формат URL
    new URL(url);

    // Для упрощения тестирования, принимаем любой валидный URL
    // В продакшене можно добавить более строгую проверку
    console.log("URL is valid:", url);

    // Проверяем расширение
    if (isImageUrl(url)) {
      console.log("URL has image extension");
      return true;
    }

    // Если расширения нет, пытаемся загрузить как изображение
    console.log("Checking image load for URL without extension");
    return await checkImageLoad(url);
  } catch (error) {
    console.error("URL validation failed:", error);
    return false;
  }
}

/**
 * Проверяет, можно ли загрузить URL как изображение
 */
export function checkImageLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve(true);
    };
    
    img.onerror = () => {
      resolve(false);
    };
    
    // Устанавливаем таймаут для избежания долгого ожидания
    setTimeout(() => {
      resolve(false);
    }, 5000);
    
    img.src = url;
  });
}

/**
 * Получает размеры изображения
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      resolve(null);
    };
    
    setTimeout(() => {
      resolve(null);
    }, 5000);
    
    img.src = url;
  });
}

/**
 * Проверяет, подходит ли изображение для использования в качестве фона
 * (минимальные размеры, соотношение сторон и т.д.)
 */
export async function validateBackgroundImage(url: string): Promise<{
  isValid: boolean;
  reason?: string;
}> {
  try {
    // Проверяем базовую валидность URL
    const isValid = await validateImageUrl(url);
    if (!isValid) {
      return { isValid: false, reason: 'Недопустимый URL изображения' };
    }
    
    // Получаем размеры изображения
    const dimensions = await getImageDimensions(url);
    if (!dimensions) {
      return { isValid: false, reason: 'Не удалось загрузить изображение' };
    }
    
    // Проверяем минимальные размеры (например, 800x600)
    if (dimensions.width < 800 || dimensions.height < 600) {
      return { 
        isValid: false, 
        reason: `Изображение слишком маленькое (${dimensions.width}x${dimensions.height}). Минимум: 800x600` 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: 'Ошибка при проверке изображения' };
  }
}
