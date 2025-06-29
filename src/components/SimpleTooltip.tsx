import * as React from "react";
import { Box } from "@radix-ui/themes";

interface SimpleTooltipProps {
  content: string;
  children: React.ReactNode;
  delayDuration?: number;
  side?: 'top' | 'bottom';
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  delayDuration = 300,
  side = 'top'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: side === 'bottom' ? rect.bottom + 5 : rect.top - 35,
          left: rect.left + rect.width / 2
        });
        setIsVisible(true);
      }
    }, delayDuration);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Box
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={{ display: "inline-block" }}
      >
        {children}
      </Box>
      
      {isVisible && (
        <Box
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            transform: "translateX(-50%)",
            zIndex: 2147483650,
            backgroundColor: "var(--gray-12)",
            color: "var(--gray-1)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "500",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
          }}
        >
          {content}
        </Box>
      )}
    </>
  );
};
