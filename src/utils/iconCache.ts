// Простой кэш иконок в памяти
const iconCache = new Map<string, { type: 'image' | 'svg'; data: string }>();

export const getIconFromCache = (iconId: string) => iconCache.get(iconId);

export const setIconToCache = (iconId: string, iconData: { type: 'image' | 'svg'; data: string }) => {
  iconCache.set(iconId, iconData);
};

export const preloadIcons = async (iconIds: string[]): Promise<void> => {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  
  const uncachedIds = iconIds.filter(id => id && !iconCache.has(id));
  if (uncachedIds.length === 0) return;
  
  return new Promise((resolve) => {
    const port = chrome.runtime.connect({ name: 'icon-manager' });
    
    port.postMessage({
      type: 'GET_MULTIPLE_ICONS',
      iconIds: uncachedIds
    });
    
    port.onMessage.addListener((response) => {
      if (response.success && response.icons) {
        response.icons.forEach((icon: any) => {
          if (icon && icon.id) {
            iconCache.set(icon.id, { type: icon.type, data: icon.data });
          }
        });
      }
      port.disconnect();
      resolve();
    });
  });
};