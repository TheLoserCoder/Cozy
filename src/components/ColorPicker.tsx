import * as React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { UpdateIcon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./ActionButtons";
import { SketchPicker, ColorResult } from "react-color";
import { createPortal } from "react-dom";
import { useTranslation } from "../locales";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onReset?: () => void;
  label?: string;
  showReset?: boolean;
  disableAlpha?: boolean;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onReset,
  label,
  showReset = false,
  disableAlpha = false,
  disabled = false
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickerPosition, setPickerPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handleColorChange = (color: ColorResult) => {
    if (disableAlpha) {
      onChange(color.hex);
    } else {
      // Если альфа-канал включен, возвращаем rgba или hex в зависимости от прозрачности
      if (color.rgb.a !== undefined && color.rgb.a < 1) {
        onChange(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`);
      } else {
        onChange(color.hex);
      }
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };

    const rect = triggerRef.current.getBoundingClientRect();
    const pickerHeight = 300;
    const pickerWidth = 225;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 8;

    // Начальная позиция - под триггером, центрированная
    let top = rect.bottom + margin;
    let left = rect.left + (rect.width / 2) - (pickerWidth / 2);

    // Проверяем, помещается ли пикер снизу
    if (top + pickerHeight > viewportHeight - margin) {
      // Если не помещается снизу, размещаем сверху
      top = rect.top - pickerHeight - margin;
    }

    // Проверяем горизонтальные границы
    if (left + pickerWidth > viewportWidth - margin) {
      left = viewportWidth - pickerWidth - margin;
    }

    if (left < margin) {
      left = margin;
    }

    // Если все еще не помещается сверху, размещаем в видимой области
    if (top < margin) {
      top = margin;
    }

    return { top, left };
  };

  const handleTriggerClick = () => {
    if (!showPicker) {
      const position = calculatePosition();
      setPickerPosition(position);
    }
    setShowPicker(!showPicker);
  };

  // Обновление позиции при изменении размера окна или прокрутке
  React.useEffect(() => {
    if (!showPicker) return;

    const updatePosition = () => {
      const position = calculatePosition();
      setPickerPosition(position);
    };

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showPicker]);

  // Закрытие при клике вне компонента
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        const pickerElement = document.querySelector('.sketch-picker');
        if (pickerElement && !pickerElement.contains(event.target as Node)) {
          setShowPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  return (
    <Box style={{ position: "relative" }}>
      <Flex align="center" justify="between" gap="3" style={{ opacity: disabled ? 0.5 : 1 }}>
        {label && (
          <Text size="2" weight="medium" as="div" style={{ flex: 1 }}>
            {label}
          </Text>
        )}

        <Flex align="center" gap="2">
        <Box
          ref={triggerRef}
          onClick={disabled ? undefined : handleTriggerClick}
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: value,
            border: "2px solid var(--gray-6)",
            borderRadius: "50%",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {!value && (
            <Text size="1" style={{ color: "var(--gray-9)" }}>
              ?
            </Text>
          )}
        </Box>

        {showReset && onReset && (
          <ActionIconButton
            variant="soft"
            size="1"
            onClick={onReset}
            aria-label={t('common.reset')}
          >
            <UpdateIcon />
          </ActionIconButton>
        )}
        </Flex>
      </Flex>

      {showPicker && createPortal(
        <Box
          style={{
            position: "fixed",
            top: pickerPosition.top,
            left: pickerPosition.left,
            zIndex: 2147483649,
            pointerEvents: "auto"
          }}
        >
          <SketchPicker
            color={value}
            onChange={handleColorChange}
            disableAlpha={disableAlpha}
          />
        </Box>,
        document.body
      )}
    </Box>
  );
};

// Добавляем глобальные стили для react-color
const colorPickerStyle = document.createElement('style');
colorPickerStyle.textContent = `
  .sketch-picker {
    z-index: 2147483649 !important;
    position: relative !important;
    box-shadow: 0 10px 40px 0 rgba(0,0,0,0.25) !important;
  }

  .sketch-picker > div {
    z-index: 2147483649 !important;
  }

  /* Дополнительные стили для всех элементов react-color */
  .sketch-picker * {
    z-index: 2147483649 !important;
  }
`;

if (!document.head.querySelector('style[data-color-picker-styles]')) {
  colorPickerStyle.setAttribute('data-color-picker-styles', 'true');
  document.head.appendChild(colorPickerStyle);
}
