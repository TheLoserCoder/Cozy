import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { App } from "./App";
import { AppThemeProvider } from "./components/ThemeProvider";
import { ErrorBoundary, setupGlobalErrorHandlers } from "./components/ErrorBoundary";
import { preloadGlobalIcons } from "./utils/globalIconCache";
import "./styles/reset.css";
import "./index.css";
import "./styles/radix-overrides.css";

// Setup global error handlers
setupGlobalErrorHandlers();

// Предзагружаем иконки до инициализации React
preloadGlobalIcons();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary maxRetries={3} autoReloadDelay={5000}>
      <Provider store={store}>
        <AppThemeProvider>
          <ErrorBoundary maxRetries={2} autoReloadDelay={3000}>
            <App />
          </ErrorBoundary>
        </AppThemeProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
