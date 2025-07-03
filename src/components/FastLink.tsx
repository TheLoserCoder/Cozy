import * as React from "react";
import { Flex, Text, Link, Box } from "@radix-ui/themes";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { ActionIconButton } from "./ActionButtons";
import { FastLink as FastLinkType } from "../entities/list/list.types";
import { createFastLinkColorFromAccent, isValidHexColor } from "../utils/colorUtils";
import { useTranslation } from "../locales";
import { Icon } from "./Icon";

interface FastLinkProps {
  fastLink: FastLinkType;
  isDragging?: boolean;
  style?: React.CSSProperties;
  dragHandleProps?: any;
  onEdit?: () => void;
  onDelete?: () => void;
  cleanMode?: boolean;
}

export const FastLink = React.forwardRef<HTMLDivElement, FastLinkProps>(({
  fastLink,
  isDragging = false,
  style = {},
  dragHandleProps = {},
  onEdit,
  onDelete,
  cleanMode = false
}, ref) => {
  const { fastLinks, radixTheme, radixRadius } = useAppSelector((state) => state.theme);
  const [showButtons, setShowButtons] = React.useState(false);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [hoverTimeout, setHoverTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();

  // Функция для получения CSS значения радиуса из темы Radix
  const getRadixRadius = () => {
    switch (radixRadius) {
      case 'none': return '0px';
      case 'small': return 'var(--radius-2)';
      case 'medium': return 'var(--radius-3)';
      case 'large': return 'var(--radius-4)';
      case 'full': return '50%';
      default: return 'var(--radius-3)';
    }
  };

  // Определяем цвет задника (внешний круг): индивидуальный цвет > глобальный цвет > акцентный цвет
  const backdropColor = (fastLink.customBackdropColor && fastLink.customBackdropColor !== "")
    ? fastLink.customBackdropColor
    : (fastLinks.globalBackdropColor && fastLinks.globalBackdropColor !== "")
      ? fastLinks.globalBackdropColor
      : radixTheme;

  // Определяем цвет фона иконки (внутренний круг): индивидуальный цвет > глобальный цвет > производный от акцента
  const iconBackgroundColor = (fastLink.customIconBackgroundColor && fastLink.customIconBackgroundColor !== "")
    ? fastLink.customIconBackgroundColor
    : (fastLinks.globalIconBackgroundColor && fastLinks.globalIconBackgroundColor !== "")
      ? fastLinks.globalIconBackgroundColor
      : (isValidHexColor(radixTheme) ? `color-mix(in srgb, ${radixTheme} 15%, white 85%)` : '#FFFFFF');
  // Определяем цвет текста: индивидуальный цвет > глобальный цвет > производный от акцентного
  const textColor = (fastLink.customTextColor && fastLink.customTextColor !== "")
    ? fastLink.customTextColor
    : (fastLinks.globalTextColor && fastLinks.globalTextColor !== "")
      ? fastLinks.globalTextColor
      : (isValidHexColor(radixTheme) ? createFastLinkColorFromAccent(radixTheme) : '#6B7280');

  // Определяем цвет иконки: индивидуальный цвет > глобальный цвет > акцентный
  const iconColor = (fastLink.iconColor && fastLink.iconColor !== "")
    ? fastLink.iconColor
    : (fastLinks.globalIconColor && fastLinks.globalIconColor !== "")
      ? fastLinks.globalIconColor
      : (isValidHexColor(radixTheme) ? radixTheme : '#000000');
  const handleClick = (e: React.MouseEvent) => {
    // Предотвращаем активацию ссылки во время перетаскивания
    if (isDragActive || e.detail === 0) {
      e.preventDefault();
      return;
    }
    
    // Открываем ссылку в текущей вкладке
    window.location.href = fastLink.url;
  };

  const handleMouseDown = () => {
    setIsDragActive(false);
  };

  const handleDragStart = () => {
    setIsDragActive(true);
  };

  const handleDragEnd = () => {
    // Небольшая задержка, чтобы предотвратить клик после завершения перетаскивания
    setTimeout(() => setIsDragActive(false), 100);
  };

  React.useEffect(() => {
    if (dragHandleProps?.onDragStart) {
      const originalDragStart = dragHandleProps.onDragStart;
      dragHandleProps.onDragStart = (e: any) => {
        handleDragStart();
        originalDragStart(e);
      };
    }
    if (dragHandleProps?.onDragEnd) {
      const originalDragEnd = dragHandleProps.onDragEnd;
      dragHandleProps.onDragEnd = (e: any) => {
        handleDragEnd();
        originalDragEnd(e);
      };
    }
  }, [dragHandleProps]);

  // Очистка timeout при размонтировании
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <Flex
      ref={ref}
      direction="column"
      align="center"
      gap="2"
      className="fast-link-container"
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragActive ? 'grabbing' : 'pointer',
        pointerEvents: isDragging ? "none" : "",

        position: 'relative',
        padding: '8px',
        width: '100px',
        minWidth: '80px',
      }}
      onMouseEnter={() => {
        // Очищаем предыдущий timeout если есть
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        // Устанавливаем задержку 1 секунду перед показом кнопок
        const timeout = setTimeout(() => setShowButtons(true), 1000);
        setHoverTimeout(timeout);
      }}
      onMouseLeave={() => {
        // Очищаем timeout и сразу скрываем кнопки
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
        setShowButtons(false);
      }}
      onMouseDown={handleMouseDown}
      {...dragHandleProps}
    >
      {/* Иконка с фавиконом */}
      <Link
        href={fastLink.url}
        onClick={handleClick}
        style={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: "pointer",
          transform: 'scale(1)',
          transition: 'transform 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Иконка - показываем только если не скрыта */}
        {!fastLinks.hideIcons && (
          <Box
            className={(!fastLink.customBackdropColor || fastLink.customBackdropColor === "") ? 'fast-link-icon-auto-color' : ''}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: getRadixRadius(),
              backgroundColor: backdropColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backdropFilter: fastLinks.backdropBlur > 0 ? `blur(${fastLinks.backdropBlur}px)` : 'none',
            }}
          >
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: getRadixRadius(),
                backgroundColor: iconBackgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {fastLink.iconId ? (
                <Icon
                  iconId={fastLink.iconId}
                  iconType={fastLink.iconType || 'favicon'}
                  fallbackText={fastLink.title}
                  size={20}
                  color={iconColor}
                />
              ) : fastLink.iconUrl ? (
                <img
                  src={fastLink.iconUrl}
                  alt={fastLink.title}
                  style={{
                    width: '20px',
                    height: '20px',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    // Fallback к первой букве названия, если иконка не загрузилась
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span style="font-size: 12px; font-weight: bold; color: #666;">${fastLink.title.charAt(0).toUpperCase()}</span>`;
                    }
                  }}
                />
              ) : (
                <Text size="2" weight="bold" style={{ color: '#666' }}>
                  {fastLink.title.charAt(0).toUpperCase()}
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* Заголовок - показываем только если не скрыт */}
        {!fastLinks.hideText && (
          <Text
            size="2"
            weight="medium"
            style={{
              color: textColor,
              textAlign: 'center',
              maxWidth: '90px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: "var(--app-font-family, inherit)"
            }}
          >
            {fastLink.title}
          </Text>
        )}
         {/* Кнопки редактирования и удаления - скрыты в чистом режиме */}
        {!cleanMode && (
          <Flex
            gap="1"
            style={{
              position: 'absolute',
              bottom: '-10px',
              zIndex: "10",
              left: '50%',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              borderRadius: '7px',
              padding: '4px',
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(5px)',
              transition: 'all 0.1s ease-in-out',
              pointerEvents: showButtons ? 'auto' : 'none',
            }}
          >
          <div style={{ width: '24px', height: '24px' }}>
            <ActionIconButton
             
              color="gray"
              size="1"
              onClick={(e?: React.MouseEvent) => {
                e?.preventDefault();
                e?.stopPropagation();
                onEdit?.();
              }}
              aria-label={t('tooltips.editItem')}
            >
              <Pencil2Icon style={{ width: '12px', height: '12px' }} />
            </ActionIconButton>
          </div>
          <div style={{ width: '24px', height: '24px' }}>
            <ActionIconButton
              variant="soft"
              color="red"
              size="1"
              onClick={(e?: React.MouseEvent) => {
                e?.preventDefault();
                e?.stopPropagation();
                onDelete?.();
              }}
              aria-label={t('tooltips.deleteItem')}
            >
              <TrashIcon style={{ width: '12px', height: '12px' }} />
            </ActionIconButton>
          </div>
        </Flex>
        )}
      </Link>

     
    </Flex>
  );
});

FastLink.displayName = 'FastLink';
