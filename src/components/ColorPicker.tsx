import * as React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./ActionButtons";
import { SketchPicker, ColorResult } from "react-color";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onReset?: () => void;
  label?: string;
  showReset?: boolean;
  disableAlpha?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onReset,
  label,
  showReset = false,
  disableAlpha = false
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickerPosition, setPickerPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);

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

  const handleTriggerClick = () => {
    if (!showPicker && triggerRef.current) {
      // Простое позиционирование относительно триггера
      setPickerPosition({
        top: 40, // Фиксированное расстояние от триггера
        left: 0
      });
    }
    setShowPicker(!showPicker);
  };

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
      {label && (
        <Text size="2" weight="medium" mb="2" as="div">
          {label}
        </Text>
      )}

      <Flex align="center" gap="2">
        <Box
          ref={triggerRef}
          onClick={handleTriggerClick}
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: value,
            border: "2px solid var(--gray-6)",
            borderRadius: "6px",
            cursor: "pointer",
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

        <Text size="2" style={{ fontFamily: "monospace", minWidth: "120px", fontSize: "11px" }}>
          {value.toUpperCase()}
        </Text>

        {showReset && onReset && (
          <ActionIconButton
            variant="soft"
            size="1"
            onClick={onReset}
            aria-label="Сбросить цвет"
          >
            <Cross2Icon />
          </ActionIconButton>
        )}
      </Flex>

      {showPicker && (
        <Box
          style={{
            position: "absolute",
            top: pickerPosition.top,
            left: pickerPosition.left,
            zIndex: 2147483649,
            marginTop: "4px"
          }}
        >
          <SketchPicker
            color={value}
            onChange={handleColorChange}
            disableAlpha={disableAlpha}
          />
        </Box>
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
