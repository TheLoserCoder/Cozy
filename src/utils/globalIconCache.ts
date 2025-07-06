// Глобальный кэш иконок, доступный до инициализации React
const globalIconCache = new Map<string, { type: 'image' | 'svg'; data: string }>();
const listeners = new Set<(iconId: string, iconData: { type: 'image' | 'svg'; data: string }) => void>();

export const getGlobalIcon = (iconId: string) => globalIconCache.get(iconId);

export const setGlobalIcon = (iconId: string, iconData: { type: 'image' | 'svg'; data: string }) => {
  globalIconCache.set(iconId, iconData);
  listeners.forEach(listener => listener(iconId, iconData));
};

export const addIconListener = (listener: (iconId: string, iconData: { type: 'image' | 'svg'; data: string }) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const preloadGlobalIcons = async (): Promise<void> => {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  
  return new Promise((resolve) => {
    try {
      const port = chrome.runtime.connect({ name: 'icon-manager' });
      port.postMessage({ type: 'GET_ALL_ICONS' });
      
      port.onMessage.addListener((response) => {
        if (response.success && response.icons) {
          response.icons.forEach((icon: any) => {
            if (icon && icon.id) {
              setGlobalIcon(icon.id, { type: icon.type, data: icon.data });
            }
          });
        }
        port.disconnect();
        resolve();
      });
    } catch (error) {
      console.error('Error preloading global icons:', error);
      resolve();
    }
  });
};