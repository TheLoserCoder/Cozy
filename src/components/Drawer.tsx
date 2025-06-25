import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AppThemeProvider } from "./ThemeProvider";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  width?: number;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onOpenChange,
  side = "right",
  width = 300,
  children,
}) => {
  const [shouldRender, setShouldRender] = React.useState(open);
  const [isClosing, setIsClosing] = React.useState(false);
  const closeTimeout = React.useRef<number | null>(null);

  // Управление открытием/закрытием с анимацией
  React.useEffect(() => {
    if (open) {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      closeTimeout.current = window.setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [open]);

  // Обработчик для кнопки закрытия: сначала проигрывается анимация, потом вызывается onOpenChange(false)
  const handleRequestClose = React.useCallback(() => {
    setIsClosing(true);
    closeTimeout.current = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      onOpenChange(false);
    }, 300);
  }, [onOpenChange]);

  const handleAnimationEnd = () => {
    if (!open) setShouldRender(false);
  };
  return (
    <Dialog.Root open={open || isClosing} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: open || isClosing ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0)",
            zIndex: 1000,
            transition: "background 0.5s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <Dialog.Content
          asChild
          aria-describedby="drawer-desc"
          aria-label="Боковая панель"
        >
          <AppThemeProvider>
            {shouldRender && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  [side]: 0,
                  height: "100vh",
                  width,
                  maxWidth: "100vw",
                  background: "var(--color-panel)",
                  boxShadow:
                    side === "right"
                      ? "-4px 0 24px rgba(0,0,0,0.08)"
                      : "4px 0 24px rgba(0,0,0,0.08)",
                  zIndex: 1001,
                  display: "flex",
                  flexDirection: "column",
                  outline: "none",
                  animation:
                    open && !isClosing
                      ? `${side}-drawer-in 0.3s cubic-bezier(.4,0,.2,1) forwards`
                      : `${side}-drawer-out 0.3s cubic-bezier(.4,0,.2,1) forwards`,
                }}
              >
                <Dialog.Title
                  style={{
                    position: "absolute",
                    left: -9999,
                    top: "auto",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                  }}
                >
                  Drawer
                </Dialog.Title>
                <Dialog.Description
                  id="drawer-desc"
                  style={{
                    position: "absolute",
                    left: -9999,
                    top: "auto",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                  }}
                >
                  Боковая панель с настройками и дополнительным контентом
                </Dialog.Description>
                {/* Прокидываем обработчик для кастомной кнопки закрытия */}
                {React.Children.map(children, (child) =>
                  React.isValidElement(child)
                    ? React.cloneElement(child as any, { onRequestClose: handleRequestClose })
                    : child
                )}
              </div>
            )}
          </AppThemeProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Глобальные keyframes для анимации Drawer
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes right-drawer-in {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    @keyframes right-drawer-out {
      from { transform: translateX(0); }
      to { transform: translateX(100%); }
    }
    @keyframes left-drawer-in {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes left-drawer-out {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); }
    }
  `;
  if (!document.head.querySelector('style[data-drawer-anim]')) {
    style.setAttribute('data-drawer-anim', '');
    document.head.appendChild(style);
  }
}
