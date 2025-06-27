/**
 * Извлекает доминирующий цвет из favicon
 */
export async function extractFaviconColor(iconUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve('#3E63DD'); // Fallback цвет
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Подсчитываем частоту цветов
        const colorCount: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Игнорируем прозрачные и очень светлые пиксели
          if (a < 128 || (r > 240 && g > 240 && b > 240)) {
            continue;
          }
          
          // Группируем похожие цвета
          const roundedR = Math.round(r / 32) * 32;
          const roundedG = Math.round(g / 32) * 32;
          const roundedB = Math.round(b / 32) * 32;
          
          const colorKey = `${roundedR},${roundedG},${roundedB}`;
          colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
        }
        
        // Находим самый частый цвет
        let maxCount = 0;
        let dominantColor = '#3E63DD';
        
        for (const [color, count] of Object.entries(colorCount)) {
          if (count > maxCount) {
            maxCount = count;
            const [r, g, b] = color.split(',').map(Number);
            dominantColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          }
        }
        
        resolve(dominantColor);
      } catch (error) {
        console.warn('Error extracting favicon color:', error);
        resolve('#3E63DD'); // Fallback цвет
      }
    };
    
    img.onerror = () => {
      resolve('#3E63DD'); // Fallback цвет
    };
    
    img.src = iconUrl;
  });
}

/**
 * Определяет, является ли цвет светлым
 */
export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Используем формулу яркости
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
