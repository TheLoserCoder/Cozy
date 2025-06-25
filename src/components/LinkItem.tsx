import * as React from "react";
import { Flex, Text } from "@radix-ui/themes";

interface LinkItemProps {
  url: string;
  title: string;
  iconUrl?: string;
  color?: string;
  className?: string;
  globalDisableClick?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
}

export const LinkItem: React.FC<LinkItemProps> = ({ url, title, iconUrl, color, className, globalDisableClick, dragHandleProps }) => {
  // Флаг, был ли drag
  const dragRef = React.useRef(false);

  React.useEffect(() => {
    // Сбросить dragRef при разблокировке
    if (!globalDisableClick) dragRef.current = false;
  }, [globalDisableClick]);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Не блокируем событие, чтобы dnd-kit работал корректно
    },
    []
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (globalDisableClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [globalDisableClick]
  );

  return (
    <a
      href={url}
      style={{ color, textDecoration: "none" }}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      draggable={false}
      {...dragHandleProps}
    >
      <Flex align="center" gap="3" px="3" py="2" tabIndex={0} style={{ transition: "background 0.15s", cursor: "pointer", borderRadius: 9999 }} asChild>
        <div>
          {iconUrl && (
            <span style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
              <img src={iconUrl} alt="icon" style={{ width: 20, height: 20, borderRadius: 4 }} />
            </span>
          )}
          <Text as="span" size="3" weight="medium" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </Text>
        </div>
      </Flex>
    </a>
  );
};
