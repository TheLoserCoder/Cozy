import * as React from "react";
import { Box } from "@radix-ui/themes";

interface CustomPopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CustomPopover: React.FC<CustomPopoverProps> = ({
  trigger,
  content,
  open: controlledOpen,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const parentRect = triggerRef.current.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
    const popoverWidth = 400;
    const popoverHeight = 500;
    const margin = 8;
    
    // Позиция относительно родителя (центрируем по горизонтали)
    let top = triggerRect.bottom - parentRect.top + margin;
    let left = triggerRect.left - parentRect.left + (triggerRect.width / 2) - (popoverWidth / 2);
    
    // Проверяем выход за правую границу
    if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - popoverWidth - margin - (triggerRect.left - parentRect.left);
    }
    
    // Проверяем выход за левую границу
    if (left < margin) {
      left = margin;
    }
    
    // Проверяем выход за нижнюю границу
    const showAbove = triggerRect.bottom + popoverHeight > window.innerHeight - margin;
    if (showAbove) {
      top = triggerRect.top - parentRect.top - margin;
      // Устанавливаем transform для позиционирования снизу вверх
      contentRef.current.style.transform = 'translateY(-100%)';
    } else {
      contentRef.current.style.transform = 'translateY(0)';
    }
    
    contentRef.current.style.top = `${top}px`;
    contentRef.current.style.left = `${left}px`;
    contentRef.current.style.transformOrigin = showAbove ? 'bottom center' : 'top center';
  }, [isOpen]);

  const handleTriggerClick = () => {
    const newOpen = !isOpen;
    
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Закрытие при клике вне
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        triggerRef.current && 
        !triggerRef.current.contains(target) &&
        contentRef.current &&
        !contentRef.current.contains(target)
      ) {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  // Обновление позиции
  React.useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen, updatePosition]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {isOpen && (
        <Box
          ref={contentRef}
          className="custom-popover-content"
          style={{
            position: "absolute",
            zIndex: 1000,
            backgroundColor: "white",
            border: "1px solid var(--gray-6)",
            borderRadius: "8px",
            boxShadow: "0 10px 40px 0 rgba(0,0,0,0.25)",
            width: "400px",
            maxHeight: "500px",
            padding: "12px"
          }}
        >
          {content}
        </Box>
      )}
    </div>
  );
};