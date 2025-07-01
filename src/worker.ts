// Firefox background worker
import ImageFilters from 'canvas-filters';
import tinycolor from 'tinycolor2';

console.log('Firefox worker loaded');

if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  globalThis.browser = chrome;
}

let db: IDBDatabase;

// IndexedDB init
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('firefox-background', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const database = (event.target as any).result;
      if (!database.objectStoreNames.contains('backgrounds')) {
        database.createObjectStore('backgrounds', { keyPath: 'id' });
      }
    };
  });
}

// Theme creation
function borderlessTheme(modify: any) {
  return {
    properties: {
      additional_backgrounds_tiling: ["no-repeat"],
      color_scheme: "dark",
      additional_backgrounds_alignment: ["center top"]
    },
    images: {
      additional_backgrounds: [modify.dataUrl],
    },
    colors: {
      frame: modify.averageColor,
      tab_background_text: modify.textColor,
      toolbar: "transparent",
      toolbar_bottom_separator: "transparent",
      toolbar_top_separator: "transparent",
      tab_selected: "rgba(255, 255, 255, .1)",
      tab_line: "transparent",
      tab_text: modify.textColor,
      toolbar_field_text: modify.textColor,
      toolbar_field: "rgba(255, 255, 255, .1)",
      icons: modify.textColor,
      toolbar_field_border_focus: "transparent",
      bookmark_text: modify.textColor,
      ntp_background: modify.averageColor,
      icons_attention: modify.averageColor
    }
  };
}

// Get average color
function getAverageColor(imageData: ImageData): string {
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  r = Math.floor(r / pixelCount);
  g = Math.floor(g / pixelCount);
  b = Math.floor(b / pixelCount);
  return `rgb(${r}, ${g}, ${b})`;
}

// Get text color
function getTextColor(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match) return '#ffffff';
  const [r, g, b] = match.map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

// channelAverages2 как в Mozilla Start Page
function channelAverages2(data: Uint8ClampedArray): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return [Math.floor(r / pixelCount), Math.floor(g / pixelCount), Math.floor(b / pixelCount)];
}

// Process image с применением всех фильтров
/* async function processImage(imageUrl: string, filters: any) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imgBitMap = await createImageBitmap(blob);
    
    const width = screen.width;
    const cnv = new OffscreenCanvas(width, 200);
    const context = cnv.getContext('2d')!;
    
    context.drawImage(imgBitMap, 0, 0, width, imgBitMap.height);
    let imageData = context.getImageData(0, 0, width, 200);
    
    const averageColor = tinycolor(channelAverages2(imageData.data));
    // Применяем все фильтры из настроек
    let filtered = imageData;
    filtered = ImageFilters.StackBlur(
  filtered,
  1 + (filters.blur > 0 ? filters.blur * 10 : 0)
);
    // Blur
    if (filters.blur > 0) {
      filtered = ImageFilters.StackBlur(filtered, 50 + filters.blur * 10);
    }
    
    // Brightness
    if (filters.brightness !== 100) {
      const brightnessValue = (filters.brightness - 100) * 2.55;
      filtered = ImageFilters.BrightnessContrastPhotoshop(filtered, brightnessValue, 0);
    }
    
    // Contrast
    if (filters.contrast !== 100) {
      const contrastValue = (filters.contrast - 100) * 2.55;
      filtered = ImageFilters.BrightnessContrastPhotoshop(filtered, 0, contrastValue);
    }
    
    // Saturation
    if (filters.saturate !== 100) {
      const satValue = filters.saturate / 100;
      filtered = ImageFilters.Vibrance(filtered, (satValue - 1) * 100);
    }
    
    // Grayscale (более мягкое применение)
    if (filters.grayscale > 0) {
      filtered = ImageFilters.Desaturate(filtered, (filters.grayscale / 100) * 0.5);
    }
    
    // Sepia
    if (filters.sepia > 0) {
      filtered = ImageFilters.Sepia(filtered, filters.sepia / 100);
    }
    
    // Invert
    if (filters.invert > 0) {
      filtered = ImageFilters.Invert(filtered);
    }
    
    // Hue rotate
    if (filters.hueRotate !== 0) {
      filtered = ImageFilters.HSLAdjustment(filtered, filters.hueRotate, 0, 0);
    } 
    
      
    // Дополнительное затемнение как в Mozilla Start Page
    //filtered = ImageFilters.BrightnessContrastPhotoshop(filtered, -30, -10);
  

// Brightness
if (filters.brightness !== 100) {
  const bMul = filters.brightness / 100;
  filtered = ImageFilters.ColorTransformFilter(
    filtered,
    bMul, bMul, bMul, 1,
    0,    0,    0,    0
  );
}

// Contrast
if (filters.contrast !== 100) {
  const cMul = filters.contrast / 100;
  const cOff = 128 * (1 - cMul);
  filtered = ImageFilters.ColorTransformFilter(
    filtered,
    cMul, cMul, cMul, 1,
    cOff, cOff, cOff, 0
  );
}

// Saturation via HSLAdjustment
if (filters.saturate !== 100) {
  // delta = +n или −n
  const satDelta = filters.saturate - 100;
  filtered = ImageFilters.HSLAdjustment(
    filtered,
    0,
    satDelta,
    0
  );
}

// Общие матрицы для смешения
const I = [ // identity
  1,0,0,0,0,
  0,1,0,0,0,
  0,0,1,0,0,
  0,0,0,1,0
];
const M_gray = [ // полная серость
  0.2126,0.7152,0.0722,0,0,
  0.2126,0.7152,0.0722,0,0,
  0.2126,0.7152,0.0722,0,0,
  0,     0,     0,     1,0
];
const M_sepia = [
  0.393,0.769,0.189,0,0,
  0.349,0.686,0.168,0,0,
  0.272,0.534,0.131,0,0,
  0,    0,    0,    1,0
];
const M_invert = [
  -1,0, 0, 0,255,
   0,-1,0, 0,255,
   0,0,-1,0,255,
   0,0, 0,1,  0
];
// функция смешения матриц
function mixMatrix(M, t) {
  return I.map((v, i) => v * (1 - t) + M[i] * t);
}

// Grayscale
if (filters.grayscale > 0) {
  const t = filters.grayscale / 100;
  filtered = ImageFilters.ColorMatrixFilter(
    filtered,
    mixMatrix(M_gray, t)
  );
}

// Sepia
if (filters.sepia > 0) {
  const t = filters.sepia / 100;
  filtered = ImageFilters.ColorMatrixFilter(
    filtered,
    mixMatrix(M_sepia, t)
  );
}

// Invert
if (filters.invert > 0) {
  const t = filters.invert / 100;
  filtered = ImageFilters.ColorMatrixFilter(
    filtered,
    mixMatrix(M_invert, t)
  );
}

// Hue‑rotate
if (filters.hueRotate > 0) {
  filtered = ImageFilters.HSLAdjustment(
    filtered,
    filters.hueRotate,
    0,
    0
  );
}
    const textColor = averageColor.isLight() ? "black" : "white";
    averageColor.lighten(40);
    
    cnv.height = 200;
    context.putImageData(filtered, 0, 0);
    const blobData = await cnv.convertToBlob();
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = () => {
        resolve({
          dataUrl: reader.result,
          averageColor: averageColor.toHexString(),
          textColor
        });
      };
      reader.readAsDataURL(blobData);
    });
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
 */

// Process image с применением всех фильтров
async function processImage(imageUrl: string, filters: any) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imgBitMap = await createImageBitmap(blob);
    
    const width = screen.width;
    const cnv = new OffscreenCanvas(width, 200);
    const context = cnv.getContext('2d')!;
    
    context.drawImage(imgBitMap, 0, 0, width, imgBitMap.height);
    let imageData = context.getImageData(0, 0, width, 200);
    
    const averageColor = tinycolor(channelAverages2(imageData.data));
    // Применяем все фильтры из настроек
    let filtered = imageData;
   
    if(filters.blur && filters.blur > 0){
      filtered = ImageFilters.StackBlur(filtered, filters.blur * 5);

    } else{
      filtered = ImageFilters.BrightnessContrastPhotoshop(ImageFilters.StackBlur(filtered, 50), -30, -10);
    }


    // Brightness
    
    if (filters.brightness && filters.brightness !== 100) {
      const bMul = filters.brightness / 100;
      filtered = ImageFilters.ColorTransformFilter(
        filtered,
        bMul, bMul, bMul, 1,
        0,    0,    0,    0
      );
    }
    
    // Contrast
    if (filters.contrast && filters.contrast !== 100) {
      const cMul = filters.contrast / 100;
      const cOff = 128 * (1 - cMul);
      filtered = ImageFilters.ColorTransformFilter(
        filtered,
        cMul, cMul, cMul, 1,
        cOff, cOff, cOff, 0
      );
    }
    
    // Saturation via HSLAdjustment
    if (filters.saturate && filters.saturate !== 100) {
      // delta = +n или −n
      const satDelta = filters.saturate - 100;
      filtered = ImageFilters.HSLAdjustment(
        filtered,
        0,
        satDelta,
        0
      );
    }
    
    // Общие матрицы для смешения
    const I = [ // identity
      1,0,0,0,0,
      0,1,0,0,0,
      0,0,1,0,0,
      0,0,0,1,0
    ];
    const M_gray = [ // полная серость
      0.2126,0.7152,0.0722,0,0,
      0.2126,0.7152,0.0722,0,0,
      0.2126,0.7152,0.0722,0,0,
      0,     0,     0,     1,0
    ];
    const M_sepia = [
      0.393,0.769,0.189,0,0,
      0.349,0.686,0.168,0,0,
      0.272,0.534,0.131,0,0,
      0,    0,    0,    1,0
    ];
    const M_invert = [
      -1,0, 0, 0,255,
       0,-1,0, 0,255,
       0,0,-1,0,255,
       0,0, 0,1,  0
    ];
    // функция смешения матриц
    function mixMatrix(M, t) {
      return I.map((v, i) => v * (1 - t) + M[i] * t);
    }
    
    // Grayscale
    if (filters.grayscale > 0) {
      const t = filters.grayscale / 100;
      filtered = ImageFilters.ColorMatrixFilter(
        filtered,
        mixMatrix(M_gray, t)
      );
    }
    
   
    
    // Invert
    if (filters.invert > 0) {
      const t = filters.invert / 100;
      filtered = ImageFilters.ColorMatrixFilter(
        filtered,
        mixMatrix(M_invert, t)
      );
    }
    
    // Hue‑rotate
    if (filters.hueRotate > 0) {
      filtered = ImageFilters.HSLAdjustment(
        filtered,
        filters.hueRotate,
        0,
        0
      );
    }

     // Sepia
    if (filters.sepia > 0) {
      const t = filters.sepia / 100;
      filtered = ImageFilters.ColorMatrixFilter(
        filtered,
        mixMatrix(M_sepia, t)
      );
    }
    
    const textColor = averageColor.isLight() ? "black" : "white";
    averageColor.lighten(40);
    
    // cnv.height = 200;  <-- убрали, иначе всё очищается здесь
    
    context.putImageData(filtered, 0, 0);
    const blobData = await cnv.convertToBlob();
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = () => {
        resolve({
          dataUrl: reader.result,
          averageColor: averageColor.toHexString(),
          textColor
        });
      };
      reader.readAsDataURL(blobData);
    });
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Apply theme
async function applyTheme(imageUrl: string, filters: any) {
  try {
    const topbar = await processImage(imageUrl, filters);
    const theme = borderlessTheme(topbar);
    
    if (browser.theme && browser.theme.update) {
      await browser.theme.update(theme);
      
      const data = { id: 'current', imageUrl, filters, topbar };
      const transaction = db.transaction(['backgrounds'], 'readwrite');
      const store = transaction.objectStore('backgrounds');
      await store.put(data);
      
      console.log('Theme applied');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to apply theme:', error);
    return false;
  }
}

// Port listener
if (typeof browser !== 'undefined' && browser.runtime) {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === 'firefox-background') {
      port.onMessage.addListener(async (message) => {
        if (message.type === 'FIREFOX_BACKGROUND') {
          const { imageUrl, filters } = message;
          const success = await applyTheme(imageUrl, filters);
          port.postMessage({ success });
        } else if (message.type === 'FIREFOX_RESET') {
          // Сбрасываем тему Firefox
          if (browser.theme && browser.theme.reset) {
            await browser.theme.reset();
            console.log('Firefox theme reset');
          }
          port.postMessage({ success: true });
        }
      });
    }
  });
}

// Проверка и автоприменение темы при загрузке
async function checkAndApplyTheme() {
  try {
    // Проверяем включен ли borderless режим
    const borderlessEnabled = localStorage.getItem('borderless-background');
    if (borderlessEnabled === 'true') {
      // Получаем текущий фон и фильтры
      const currentBg = localStorage.getItem('current-background');
      const images = JSON.parse(localStorage.getItem('background-images') || '[]');
      const filters = JSON.parse(localStorage.getItem('background-filters') || '{}');
      
      if (currentBg && images.length > 0) {
        const selectedImage = images.find((img: any) => img.id === currentBg);
        if (selectedImage) {
          console.log('Auto-applying theme on startup');
          await applyTheme(selectedImage.url, filters);
        }
      }
    }
  } catch (error) {
    console.error('Error checking theme on startup:', error);
  }
}

// Слушаем изменения в localStorage для автообновления темы
if (typeof window !== 'undefined') {
  window.addEventListener('storage', async (event) => {
    if (event.key === 'background-filters' || event.key === 'current-background' || event.key === 'borderless-background') {
      const borderlessEnabled = localStorage.getItem('borderless-background');
      
      if (borderlessEnabled === 'true') {
        // Включен borderless - применяем тему с фильтрами
        const currentBg = localStorage.getItem('current-background');
        const images = JSON.parse(localStorage.getItem('background-images') || '[]');
        const filters = JSON.parse(localStorage.getItem('background-filters') || '{}');
        
        if (currentBg && images.length > 0) {
          const selectedImage = images.find((img: any) => img.id === currentBg);
          if (selectedImage) {
            console.log('Auto-updating theme with filters on change');
            await applyTheme(selectedImage.url, filters);
          }
        }
      } else if (event.key === 'borderless-background' && borderlessEnabled === 'false') {
        // Выключен borderless - сбрасываем тему
        if (browser.theme && browser.theme.reset) {
          await browser.theme.reset();
          console.log('Theme reset on borderless disable');
        }
      }
    }
  });
}

// Init
initDB().then(async () => {
  console.log('Firefox worker ready');
  // Автоприменение темы при загрузке
  await checkAndApplyTheme();
}).catch(console.error);