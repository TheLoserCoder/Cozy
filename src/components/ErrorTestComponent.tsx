import * as React from "react";
import { Button, Flex, Text, Box } from "@radix-ui/themes";
import { useErrorHandler } from "../hooks/useErrorHandler";

// Компонент для тестирования ErrorBoundary (только в development режиме)
export const ErrorTestComponent: React.FC = () => {
  const { handleError, handleAsyncError, clearErrorLogs, getErrorLogs } = useErrorHandler('ErrorTestComponent');
  const [errorLogs, setErrorLogs] = React.useState<any>(null);

  // Показываем компонент только в development режиме
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const throwSyncError = () => {
    throw new Error('Test synchronous error from ErrorTestComponent');
  };

  const throwAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Test asynchronous error from ErrorTestComponent');
  };

  const throwCriticalError = () => {
    // Симулируем критическую ошибку
    throw new Error('ChunkLoadError: Loading chunk 1 failed');
  };

  const handleAsyncErrorTest = async () => {
    try {
      await handleAsyncError(throwAsyncError, { shouldReload: false });
    } catch (error) {
      console.log('Async error caught and handled');
    }
  };

  const handleManualError = () => {
    handleError(new Error('Manual error test'), { 
      shouldReload: false,
      logToConsole: true,
      logToStorage: true 
    });
  };

  const showErrorLogs = () => {
    const logs = getErrorLogs();
    setErrorLogs(logs);
  };

  const clearLogs = () => {
    clearErrorLogs();
    setErrorLogs(null);
  };

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <Text size="2" weight="bold" style={{ marginBottom: '12px', display: 'block' }}>
        🧪 Error Testing (Dev Only)
      </Text>
      
      <Flex direction="column" gap="2">
        <Button size="1" variant="outline" onClick={throwSyncError}>
          Sync Error
        </Button>
        
        <Button size="1" variant="outline" onClick={handleAsyncErrorTest}>
          Async Error
        </Button>
        
        <Button size="1" variant="outline" onClick={throwCriticalError}>
          Critical Error
        </Button>
        
        <Button size="1" variant="outline" onClick={handleManualError}>
          Manual Error
        </Button>
        
        <Button size="1" variant="soft" onClick={showErrorLogs}>
          Show Logs
        </Button>
        
        <Button size="1" variant="soft" onClick={clearLogs}>
          Clear Logs
        </Button>
      </Flex>

      {errorLogs && (
        <Box style={{ marginTop: '12px', fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
          <Text size="1" weight="bold">Error Logs:</Text>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(errorLogs, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};
