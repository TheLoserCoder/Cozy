export const isFirefox = (): boolean => {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

let firefoxPort: chrome.runtime.Port | null = null;

function createFirefoxPort(): chrome.runtime.Port {
  const port = chrome.runtime.connect({ name: 'firefox-background' });
  
  port.onDisconnect.addListener(() => {
    console.log('Firefox port disconnected');
    firefoxPort = null;
  });
  
  return port;
}

function getFirefoxPort(): chrome.runtime.Port {
  if (!firefoxPort) {
    firefoxPort = createFirefoxPort();
  }
  return firefoxPort;
}

export const sendBackgroundToFirefox = async (imageUrl: string, filters: any): Promise<boolean> => {
  if (!isFirefox()) return false;
  
  try {
    let port = getFirefoxPort();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      
      const messageListener = (response: any) => {
        clearTimeout(timeout);
        port.onMessage.removeListener(messageListener);
        resolve(response.success || false);
      };
      
      port.onMessage.addListener(messageListener);
      
      try {
        port.postMessage({
          type: 'FIREFOX_BACKGROUND',
          imageUrl,
          filters
        });
      } catch (error) {
        // Порт закрылся, создаем новый
        console.log('Port closed, creating new one');
        firefoxPort = null;
        port = getFirefoxPort();
        port.onMessage.addListener(messageListener);
        
        try {
          port.postMessage({
            type: 'FIREFOX_BACKGROUND',
            imageUrl,
            filters
          });
        } catch (retryError) {
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  } catch (error) {
    console.error('Failed to send message to Firefox worker:', error);
    return false;
  }
};

export const resetFirefoxTheme = async (): Promise<boolean> => {
  if (!isFirefox()) return false;
  
  try {
    let port = getFirefoxPort();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      
      const messageListener = (response: any) => {
        clearTimeout(timeout);
        port.onMessage.removeListener(messageListener);
        resolve(response.success || false);
      };
      
      port.onMessage.addListener(messageListener);
      
      try {
        port.postMessage({
          type: 'FIREFOX_RESET'
        });
      } catch (error) {
        // Порт закрылся, создаем новый
        console.log('Port closed, creating new one for reset');
        firefoxPort = null;
        port = getFirefoxPort();
        port.onMessage.addListener(messageListener);
        
        try {
          port.postMessage({
            type: 'FIREFOX_RESET'
          });
        } catch (retryError) {
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  } catch (error) {
    console.error('Failed to reset Firefox theme:', error);
    return false;
  }
};