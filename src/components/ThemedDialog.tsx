import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SettingsThemeProvider } from "./ThemeProvider";

interface ThemedDialogProps extends React.PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overlayClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}> {}

export const ThemedDialog: React.FC<ThemedDialogProps & { title?: React.ReactNode }> = ({
  open,
  onOpenChange,
  children,
  overlayClassName,
  contentClassName,
  ariaLabel = "Диалоговое окно",
  ariaDescribedBy = undefined,
  title,
}) => {
  const [shouldRender, setShouldRender] = React.useState(open);
  const closeTimeout = React.useRef<number | null>(null);

  // Задержка размонтирования для fade-out
  React.useEffect(() => {
    if (open) {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      setShouldRender(true);
    } else {
      closeTimeout.current = window.setTimeout(() => setShouldRender(false), 250);
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [open]);

  // Обработка onOpenChange с задержкой для fade-out
  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setShouldRender(true); // не размонтируем сразу
      // вызываем onOpenChange(false) только после fade-out
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      closeTimeout.current = window.setTimeout(() => onOpenChange(false), 250);
    } else {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      onOpenChange(true);
    }
  }, [onOpenChange]);

  // Глобальные keyframes для fade
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.head.querySelector('style[data-themed-dialog]')) {
      const style = document.createElement("style");
      style.innerHTML = `
        @keyframes themed-dialog-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes themed-dialog-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      style.setAttribute('data-themed-dialog', '');
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Dialog.Root open={shouldRender} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {shouldRender && (
          <>
            <Dialog.Overlay
              className={overlayClassName}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                zIndex: 1000,
                animation: `${open ? "themed-dialog-fade-in" : "themed-dialog-fade-out"} 0.25s cubic-bezier(.4,0,.2,1) forwards`,
              }}
            />
            <Dialog.Content
              asChild={false}
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
              style={{
                zIndex: 1010,
                background: "transparent",
                boxShadow: "none",
                border: "none",
                padding: 0,
                overflow: "visible",
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                display: open ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <SettingsThemeProvider>
                <div
                  className={contentClassName}
                  style={{
                    pointerEvents: "auto",
                    animation: `${open ? "themed-dialog-fade-in" : "themed-dialog-fade-out"} 0.25s cubic-bezier(.4,0,.2,1) forwards`,
                  }}
                >
                  {/* Прозрачность для .radix-themes внутри диалога */}
                  <style>{`
                    .radix-themes {
                      background: transparent !important;
                      box-shadow: none !important;
                    }
                  `}</style>
                  {title && (
                    <Dialog.Title asChild>
                      {typeof title === "string" ? <div>{title}</div> : title}
                    </Dialog.Title>
                  )}
                  {children}
                </div>
              </SettingsThemeProvider>
            </Dialog.Content>
          </>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
