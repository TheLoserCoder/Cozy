// Service worker for all browsers
console.log('Service worker loaded');

// Polyfill for browser API
if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  globalThis.browser = chrome;
}

let db: IDBDatabase;

// IndexedDB init
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cozy-data', 3);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const database = (event.target as any).result;
      const oldVersion = event.oldVersion;
      
      if (oldVersion < 1) {
        if (!database.objectStoreNames.contains('backgrounds')) {
          database.createObjectStore('backgrounds', { keyPath: 'id' });
        }
      }
      
      if (oldVersion < 2) {
        if (!database.objectStoreNames.contains('icons')) {
          database.createObjectStore('icons', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('icon-packs')) {
          database.createObjectStore('icon-packs', { keyPath: 'id' });
        }
      }
      
      if (oldVersion < 3) {
        if (!database.objectStoreNames.contains('icons')) {
          database.createObjectStore('icons', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('icon-packs')) {
          database.createObjectStore('icon-packs', { keyPath: 'id' });
        }
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


// Process image - simplified version without heavy dependencies
async function processImage(imageUrl: string, filters: any) {
  try {
    // Динамический импорт для избежания ошибок при загрузке
    const [ImageFilters, tinycolor] = await Promise.all([
      import('canvas-filters'),
      import('tinycolor2')
    ]);
    
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imgBitMap = await createImageBitmap(blob);
    
    const width = screen.width;
    const cnv = new OffscreenCanvas(width, 200);
    const context = cnv.getContext('2d')!;
    
    context.drawImage(imgBitMap, 0, 0, width, imgBitMap.height);
    let imageData = context.getImageData(0, 0, width, 200);
    
    const averageColor = tinycolor.default(channelAverages2(imageData.data));
    let filtered = imageData;
   
    if(filters.blur && filters.blur > 0){
      filtered = ImageFilters.default.StackBlur(filtered, filters.blur * 5);
    } else{
      filtered = ImageFilters.default.BrightnessContrastPhotoshop(ImageFilters.default.StackBlur(filtered, 50), -30, -10);
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
    if (filters.grayscale && filters.grayscale > 0) {
      const t = filters.grayscale / 100;
      filtered = ImageFilters.ColorMatrixFilter(
        filtered,
        mixMatrix(M_gray, t)
      );
    }
    
    // Sepia
    if (filters.sepia && filters.sepia > 0) {
      const t = filters.sepia / 100;
      filtered = ImageFilters.ColorMatrixFilter(
        filtered,
        mixMatrix(M_sepia, t)
      );
    }
    
    // Invert
    if (filters.invert && filters.invert > 0) {
      const t = filters.invert / 100;
      filtered = ImageFilters.ColorMatrixFilter(
        filtered,
        mixMatrix(M_invert, t)
      );
    }
    
    // Hue‑rotate
    if (filters.hueRotate && filters.hueRotate > 0) {
      filtered = ImageFilters.HSLAdjustment(
        filtered,
        filters.hueRotate,
        0,
        0
      );
    }
    
    const textColor = averageColor.isLight() ? "black" : "white";
    averageColor.lighten(40);
    
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

// Функции для работы с иконками
async function downloadFavicon(url: string): Promise<{ type: 'image' | 'svg'; data: string } | null> {
  try {
    const domain = new URL(url).origin;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    
    const response = await fetch(faviconUrl);
    if (!response.ok) return null;
    
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return { type: 'image', data: dataUrl };
  } catch (error) {
    console.error('Error downloading favicon:', error);
    return null;
  }
}

async function saveIcon(icon: any): Promise<boolean> {
  try {
    if (!db) {
      console.error('Database not initialized');
      return false;
    }
    console.log("icon saving: ", icon);
    const transaction = db.transaction(['icons'], 'readwrite');
    const store = transaction.objectStore('icons');
    await new Promise((resolve, reject) => {
      const request = store.put(icon);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return true;
  } catch (error) {
    console.error('Error saving icon:', error);
    return false;
  }
}

async function getIcon(iconId: string): Promise<any | null> {
  try {
    const transaction = db.transaction(['icons'], 'readonly');
    const store = transaction.objectStore('icons');
    const request = store.get(iconId);
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error getting icon:', error);
    return null;
  }
}

async function saveIconPack(pack: any): Promise<boolean> {
  try {
    if (!db) {
      console.error('Database not initialized');
      return false;
    }
    const transaction = db.transaction(['icon-packs'], 'readwrite');
    const store = transaction.objectStore('icon-packs');
    await new Promise((resolve, reject) => {
      const request = store.put(pack);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return true;
  } catch (error) {
    console.error('Error saving icon pack:', error);
    return false;
  }
}

async function getIconPack(packId: string): Promise<any | null> {
  try {
    const transaction = db.transaction(['icon-packs'], 'readonly');
    const store = transaction.objectStore('icon-packs');
    const request = store.get(packId);
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error getting icon pack:', error);
    return null;
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
    } else if (port.name === 'icon-manager') {
      port.onMessage.addListener(async (message) => {
        switch (message.type) {
          case 'DOWNLOAD_FAVICON':
            const iconData = await downloadFavicon(message.url);
            if (iconData) {
              const icon = {
                id: message.iconId,
                name: `Favicon for ${message.url}`,
                type: iconData.type,
                data: iconData.data,
                addedAt: Date.now()
              };
              const saved = await saveIcon(icon);
              port.postMessage({ success: saved, iconId: message.iconId });
            } else {
              port.postMessage({ success: false });
            }
            break;
            
          case 'GET_ICON':
            const icon = await getIcon(message.iconId);
            port.postMessage({ success: !!icon, icon });
            break;
            
          case 'SAVE_CUSTOM_ICON':
            const customSaved = await saveIcon(message.icon);
            port.postMessage({ success: customSaved });
            break;
            
          case 'SAVE_ICON_PACK':
            const packSaved = await saveIconPack(message.pack);
            port.postMessage({ success: packSaved });
            break;
            
          case 'GET_ICON_PACK':
            const pack = await getIconPack(message.packId);
            port.postMessage({ success: !!pack, pack });
            break;
            
          case 'EXPORT_ALL_DATA':
            try {
              const iconsTransaction = db.transaction(['icons'], 'readonly');
              const iconsStore = iconsTransaction.objectStore('icons');
              const iconsRequest = iconsStore.getAll();
              
              const packsTransaction = db.transaction(['icon-packs'], 'readonly');
              const packsStore = packsTransaction.objectStore('icon-packs');
              const packsRequest = packsStore.getAll();
              
              Promise.all([
                new Promise(resolve => {
                  iconsRequest.onsuccess = () => resolve(iconsRequest.result);
                  iconsRequest.onerror = () => resolve([]);
                }),
                new Promise(resolve => {
                  packsRequest.onsuccess = () => resolve(packsRequest.result);
                  packsRequest.onerror = () => resolve([]);
                })
              ]).then(([icons, iconPacks]) => {
                port.postMessage({ success: true, icons, iconPacks });
              });
            } catch (error) {
              console.error('Error exporting IndexedDB data:', error);
              port.postMessage({ success: false });
            }
            break;
            
          case 'IMPORT_ALL_DATA':
            try {
              const { icons, iconPacks } = message;
              
              // Импортируем иконки
              if (icons && icons.length > 0) {
                const iconsTransaction = db.transaction(['icons'], 'readwrite');
                const iconsStore = iconsTransaction.objectStore('icons');
                
                for (const icon of icons) {
                  await iconsStore.put(icon);
                }
              }
              
              // Импортируем паки иконок
              if (iconPacks && iconPacks.length > 0) {
                const packsTransaction = db.transaction(['icon-packs'], 'readwrite');
                const packsStore = packsTransaction.objectStore('icon-packs');
                
                for (const pack of iconPacks) {
                  await packsStore.put(pack);
                }
              }
              
              port.postMessage({ success: true });
            } catch (error) {
              console.error('Error importing IndexedDB data:', error);
              port.postMessage({ success: false });
            }
            break;
            
          case 'DELETE_ICON_PACK':
            try {
              const transaction = db.transaction(['icon-packs'], 'readwrite');
              const store = transaction.objectStore('icon-packs');
              await new Promise((resolve, reject) => {
                const request = store.delete(message.packId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });
              port.postMessage({ success: true });
            } catch (error) {
              console.error('Error deleting icon pack:', error);
              port.postMessage({ success: false });
            }
            break;
            
          case 'DELETE_CUSTOM_ICON':
            try {
              const transaction = db.transaction(['icons'], 'readwrite');
              const store = transaction.objectStore('icons');
              await new Promise((resolve, reject) => {
                const request = store.delete(message.iconId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });
              port.postMessage({ success: true });
            } catch (error) {
              console.error('Error deleting custom icon:', error);
              port.postMessage({ success: false });
            }
            break;

          case 'SAVE_ICON':
            const { iconId, url, svg } = message.payload;
            let iconToSave = null;

            if (url) {
              const downloadedIcon = await downloadFavicon(url);
              if (downloadedIcon) {
                iconToSave = {
                  id: iconId,
                  name: `Favicon for ${url}`,
                  type: downloadedIcon.type,
                  data: downloadedIcon.data,
                  addedAt: Date.now(),
                };
              }
            } else if (svg) {
              iconToSave = {
                id: iconId,
                name: 'Custom SVG Icon',
                type: 'svg',
                data: svg,
                addedAt: Date.now(),
              };
            }

            if (iconToSave) {
              const saved = await saveIcon(iconToSave);
              port.postMessage({ 
                success: saved, 
                iconId,
                icon: saved ? iconToSave : null
              });
            } else {
              port.postMessage({ success: false });
            }
            break;

          case 'DELETE_ICON':
            try {
              const transaction = db.transaction(['icons'], 'readwrite');
              const store = transaction.objectStore('icons');
              await new Promise((resolve, reject) => {
                const request = store.delete(message.iconId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });
              port.postMessage({ success: true });
            } catch (error) {
              console.error('Error deleting icon:', error);
              port.postMessage({ success: false });
            }
            break;
            
          case 'GET_ALL_ICONS':
            try {
              if (!db) {
                await initDB();
              }
              const transaction = db.transaction(['icons'], 'readonly');
              const store = transaction.objectStore('icons');
              const request = store.getAll();
              
              const icons = await new Promise(resolve => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
              });
              
              port.postMessage({ success: true, icons });
            } catch (error) {
              console.error('Error getting all icons:', error);
              port.postMessage({ success: false, icons: [] });
            }
            break;
            
          case 'GET_MULTIPLE_ICONS':
            try {
              const transaction = db.transaction(['icons'], 'readonly');
              const store = transaction.objectStore('icons');
              const icons = [];
              
              for (const iconId of message.iconIds) {
                const request = store.get(iconId);
                const icon = await new Promise(resolve => {
                  request.onsuccess = () => resolve(request.result);
                  request.onerror = () => resolve(null);
                });
                if (icon) icons.push(icon);
              }
              
              port.postMessage({ success: true, icons });
            } catch (error) {
              console.error('Error getting multiple icons:', error);
              port.postMessage({ success: false });
            }
            break;
            
          case 'CLEAR_ALL_ICONS':
            try {
              const transaction = db.transaction(['icons'], 'readwrite');
              const store = transaction.objectStore('icons');
              await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });
              port.postMessage({ success: true });
            } catch (error) {
              console.error('Error clearing all icons:', error);
              port.postMessage({ success: false });
            }
            break;
        }
      });
    }
  });
}

// Проверка и автоприменение темы при загрузке
async function checkAndApplyTheme() {
  try {
    // Проверяем, что это Firefox
    if (!isFirefox) return;
    
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

// Проверка на Firefox
const isFirefox = typeof browser !== 'undefined' && browser.theme;

// Слушаем изменения в localStorage для автообновления темы
if (typeof window !== 'undefined' && isFirefox) {
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
  console.log('Service worker ready');
  // Автоприменение темы при загрузке только в Firefox
  if (isFirefox) {
    await checkAndApplyTheme();
  }
}).catch(console.error);