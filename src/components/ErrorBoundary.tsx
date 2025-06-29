import * as React from "react";
import { Box, Text, Button, Flex } from "@radix-ui/themes";
import { ReloadIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { localizedAlert } from "../locales";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  maxRetries?: number;
  autoReloadDelay?: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private autoReloadTimer?: number;
  private readonly maxRetries: number;
  private readonly autoReloadDelay: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
    this.maxRetries = props.maxRetries ?? 3;
    this.autoReloadDelay = props.autoReloadDelay ?? 5000; // 5 секунд по умолчанию
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Обновляем состояние, чтобы показать fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // If maximum retry count exceeded, auto-reload page
    if (this.state.retryCount >= this.maxRetries) {
      console.warn(`Maximum retry count (${this.maxRetries}) exceeded. Auto-reloading page in ${this.autoReloadDelay}ms...`);
      this.scheduleAutoReload();
    }

    // Отправляем ошибку в систему мониторинга (если есть)
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.autoReloadTimer) {
      clearTimeout(this.autoReloadTimer);
    }
  }

  private scheduleAutoReload = () => {
    this.autoReloadTimer = window.setTimeout(() => {
      window.location.reload();
    }, this.autoReloadDelay);
  };

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Здесь можно добавить отправку ошибки в систему мониторинга
    // Например, Sentry, LogRocket, или собственный сервис
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };
      
      // Сохраняем в localStorage для отладки
      const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      existingErrors.push(errorReport);
      // Храним только последние 10 ошибок
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      localStorage.setItem('app-errors', JSON.stringify(existingErrors));
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearErrors = () => {
    localStorage.removeItem('app-errors');
    this.handleReload();
  };

  render() {
    if (this.state.hasError) {
      const isMaxRetriesExceeded = this.state.retryCount >= this.maxRetries;
      
      return (
        <Box
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
          }}
        >
          <Box
            style={{
              maxWidth: '500px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Flex direction="column" align="center" gap="4">
              <ExclamationTriangleIcon 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: '#ef4444' 
                }} 
              />
              
              <Text size="6" weight="bold" align="center" style={{ color: '#1f2937' }}>
                Произошла ошибка
              </Text>
              
              <Text size="3" align="center" style={{ color: '#6b7280', lineHeight: '1.6' }}>
                {isMaxRetriesExceeded 
                  ? `Приложение столкнулось с критической ошибкой после ${this.maxRetries} попыток восстановления. Страница будет автоматически перезагружена через ${this.autoReloadDelay / 1000} секунд.`
                  : `Что-то пошло не так. Попытка восстановления ${this.state.retryCount} из ${this.maxRetries}.`
                }
              </Text>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  style={{
                    width: '100%',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '16px'
                  }}
                >
                  <Text size="2" weight="medium" style={{ color: '#374151', marginBottom: '8px' }}>
                    Детали ошибки (только в режиме разработки):
                  </Text>
                  <Text size="1" style={{ 
                    color: '#6b7280', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    lineHeight: '1.4'
                  }}>
                    {this.state.error.message}
                  </Text>
                </Box>
              )}

              <Flex gap="3" style={{ marginTop: '24px' }}>
                {!isMaxRetriesExceeded && (
                  <Button
                    onClick={this.handleRetry}
                    variant="solid"
                    color="blue"
                    size="3"
                  >
                    <ReloadIcon />
                    Попробовать снова
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReload}
                  variant={isMaxRetriesExceeded ? "solid" : "outline"}
                  color={isMaxRetriesExceeded ? "red" : "gray"}
                  size="3"
                >
                  Перезагрузить страницу
                </Button>

                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={this.handleClearErrors}
                    variant="outline"
                    color="gray"
                    size="3"
                  >
                    Очистить ошибки
                  </Button>
                )}
              </Flex>

              {isMaxRetriesExceeded && (
                <Text size="2" style={{ color: '#6b7280', marginTop: '16px' }}>
                  Автоматическая перезагрузка через {Math.ceil(this.autoReloadDelay / 1000)} сек...
                </Text>
              )}
            </Flex>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Глобальный обработчик необработанных ошибок
export const setupGlobalErrorHandlers = () => {
  // Handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // If this is a critical error, reload page
    if (isCriticalError(event.reason)) {
      console.warn('Critical error detected in unhandled promise. Reloading page...');
      localizedAlert('errors.criticalError');
      setTimeout(() => window.location.reload(), 2000);
    }
  });

  // Handler for global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    // If this is a critical error, reload page
    if (isCriticalError(event.error)) {
      console.warn('Critical error detected. Reloading page...');
      localizedAlert('errors.criticalError');
      setTimeout(() => window.location.reload(), 2000);
    }
  });
};

// Функция для определения критических ошибок
const isCriticalError = (error: any): boolean => {
  if (!error) return false;
  
  const criticalPatterns = [
    /ChunkLoadError/i,
    /Loading chunk \d+ failed/i,
    /Failed to import/i,
    /Cannot read propert(y|ies) of undefined/i,
    /Cannot read propert(y|ies) of null/i,
    /ReferenceError/i,
    /TypeError.*undefined/i,
    /TypeError.*null/i
  ];

  const errorMessage = error.message || error.toString();
  return criticalPatterns.some(pattern => pattern.test(errorMessage));
};
