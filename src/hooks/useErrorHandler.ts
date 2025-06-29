import { useCallback } from 'react';

interface ErrorHandlerOptions {
  shouldReload?: boolean;
  reloadDelay?: number;
  logToConsole?: boolean;
  logToStorage?: boolean;
}

interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  component?: string;
  userAgent: string;
  url: string;
}

export const useErrorHandler = (componentName?: string) => {
  const handleError = useCallback((
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      shouldReload = false,
      reloadDelay = 3000,
      logToConsole = true,
      logToStorage = true
    } = options;

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    if (logToConsole) {
      console.error(`Error in ${componentName || 'Unknown Component'}:`, errorObj);
    }

    if (logToStorage) {
      try {
        const errorReport: ErrorReport = {
          message: errorObj.message,
          stack: errorObj.stack,
          timestamp: new Date().toISOString(),
          component: componentName,
          userAgent: navigator.userAgent,
          url: window.location.href
        };

        const existingErrors = JSON.parse(localStorage.getItem('component-errors') || '[]');
        existingErrors.push(errorReport);
        
        // Храним только последние 20 ошибок
        if (existingErrors.length > 20) {
          existingErrors.splice(0, existingErrors.length - 20);
        }
        
        localStorage.setItem('component-errors', JSON.stringify(existingErrors));
      } catch (storageError) {
        console.error('Failed to log error to storage:', storageError);
      }
    }

    if (shouldReload) {
      console.warn(`Reloading page in ${reloadDelay}ms due to critical error...`);
      setTimeout(() => {
        window.location.reload();
      }, reloadDelay);
    }
  }, [componentName]);

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, options);
      throw error; // Re-throw чтобы вызывающий код мог обработать ошибку
    }
  }, [handleError]);

  const clearErrorLogs = useCallback(() => {
    localStorage.removeItem('component-errors');
    localStorage.removeItem('app-errors');
  }, []);

  const getErrorLogs = useCallback(() => {
    const componentErrors = JSON.parse(localStorage.getItem('component-errors') || '[]');
    const appErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
    return { componentErrors, appErrors };
  }, []);

  return {
    handleError,
    handleAsyncError,
    clearErrorLogs,
    getErrorLogs
  };
};

// Утилита для обертки async функций с автоматической обработкой ошибок
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  componentName?: string,
  options: ErrorHandlerOptions = {}
): T => {
  return ((...args: Parameters<T>) => {
    return asyncFn(...args).catch((error: Error) => {
      console.error(`Error in ${componentName || 'Async Function'}:`, error);
      
      if (options.shouldReload) {
        console.warn(`Reloading page due to critical async error...`);
        setTimeout(() => window.location.reload(), options.reloadDelay || 3000);
      }
      
      throw error;
    });
  }) as T;
};
