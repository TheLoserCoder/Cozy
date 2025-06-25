import * as React from "react";

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
      className={
        "link-item flex items-center gap-2 px-3 py-2 rounded transition-colors" +
        (className ? ` ${className}` : "")
      }
      style={{ color }}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      draggable={false}
      {...dragHandleProps}
    >
      {iconUrl && (
        <span className="drag-handle" style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
          <img src={iconUrl} alt="icon" className="w-5 h-5 rounded" />
        </span>
      )}
      <span className="truncate">{title}</span>
    </a>
  );
};
