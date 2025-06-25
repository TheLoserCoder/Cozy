import * as React from "react";

interface LinkItemProps {
  url: string;
  title: string;
  iconUrl?: string;
  color?: string;
  className?: string;
  globalDisableClick?: boolean;
}

export const LinkItem: React.FC<LinkItemProps> = ({ url, title, iconUrl, color, className, globalDisableClick }) => {
  // Флаг, был ли drag
  const dragRef = React.useRef(false);

  React.useEffect(() => {
    // Сбросить dragRef при разблокировке
    if (!globalDisableClick) dragRef.current = false;
  }, [globalDisableClick]);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (globalDisableClick) {
        dragRef.current = true;
        // Не блокируем событие, чтобы dnd-kit работал корректно
      }
    },
    [globalDisableClick]
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (globalDisableClick || dragRef.current) {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = false;
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
    >
      {iconUrl && (
        <img src={iconUrl} alt="icon" className="w-5 h-5 rounded" />
      )}
      <span className="truncate">{title}</span>
    </a>
  );
};
