import * as React from "react";
import { Box, Flex, Text, Button, Popover } from "@radix-ui/themes";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface RadixThemePickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const radixColors = [
  'gray', 'gold', 'bronze', 'brown', 'yellow', 'amber',
  'orange', 'tomato', 'red', 'ruby', 'crimson', 'pink',
  'plum', 'purple', 'violet', 'iris', 'indigo', 'blue',
  'cyan', 'teal', 'jade', 'green', 'grass', 'lime',
  'mint', 'sky'
];

// Цветовая карта для предварительного просмотра
const colorPreview: Record<string, string> = {
  gray: '#8B8D98',
  gold: '#978365',
  bronze: '#A18072',
  brown: '#AD7F58',
  yellow: '#FFE629',
  amber: '#FFC53D',
  orange: '#FF8B3E',
  tomato: '#FF6154',
  red: '#E5484D',
  ruby: '#E54666',
  crimson: '#E93D82',
  pink: '#D6409F',
  plum: '#AB4ABA',
  purple: '#8E4EC6',
  violet: '#6E56CF',
  iris: '#5B5BD6',
  indigo: '#3E63DD',
  blue: '#0090FF',
  cyan: '#00A2C7',
  teal: '#12A594',
  jade: '#29A383',
  green: '#46A758',
  grass: '#5CBB5C',
  lime: '#BDEE63',
  mint: '#86EFAC',
  sky: '#7CE2FE'
};

export const RadixThemePicker: React.FC<RadixThemePickerProps> = ({
  value,
  onChange,
  label
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <Box>
      {label && (
        <Text size="2" weight="medium" mb="2" as="div">
          {label}
        </Text>
      )}

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <Button
            variant="outline"
            style={{
              minWidth: "200px",
              justifyContent: "space-between",
              transform: "none !important",
              scale: "1 !important"
            }}
          >
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: colorPreview[value],
                  borderRadius: "3px",
                  border: "1px solid var(--gray-6)"
                }}
              />
              <Text style={{ textTransform: "capitalize" }}>{value}</Text>
            </Flex>
            <ChevronDownIcon />
          </Button>
        </Popover.Trigger>

        <Popover.Content
          className="radix-theme-picker-content"
          style={{
            zIndex: 2147483647,
            transform: "none !important",
            scale: "1 !important",
            width: "280px",
            maxHeight: "300px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--gray-6) transparent"
          }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          <Box p="2">
            <Text size="2" weight="medium" mb="2" as="div">
              Выберите цветовую схему
            </Text>
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "4px"
              }}
            >
              {radixColors.map((color) => (
                <Button
                  key={color}
                  variant={value === color ? "solid" : "soft"}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    justifyContent: "flex-start",
                    transform: "none !important",
                    scale: "1 !important"
                  }}
                >
                  <Flex align="center" gap="2">
                    <Box
                      style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: colorPreview[color],
                        borderRadius: "3px",
                        border: "1px solid var(--gray-6)"
                      }}
                    />
                    <Text style={{ textTransform: "capitalize" }}>{color}</Text>
                  </Flex>
                </Button>
              ))}
            </Box>
          </Box>
        </Popover.Content>
      </Popover.Root>
    </Box>
  );
};

// Добавляем стили для Popover с высоким z-index и прокруткой
const style = document.createElement('style');
style.textContent = `
  [data-radix-popover-content] {
    z-index: 2147483647 !important;
    transform: none !important;
    scale: 1 !important;
  }

  [data-radix-popper-content-wrapper] {
    z-index: 2147483647 !important;
    transform: none !important;
    scale: 1 !important;
  }

  /* Убираем наследование transform от родительских элементов */
  .radix-theme-picker-content,
  .radix-theme-picker-content * {
    transform: none !important;
    scale: 1 !important;
  }

  /* Стили для прокрутки в theme picker */
  .radix-theme-picker-content::-webkit-scrollbar {
    width: 6px;
  }

  .radix-theme-picker-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .radix-theme-picker-content::-webkit-scrollbar-thumb {
    background: var(--gray-6);
    border-radius: 3px;
  }

  .radix-theme-picker-content::-webkit-scrollbar-thumb:hover {
    background: var(--gray-8);
  }
`;

if (!document.head.querySelector('style[data-radix-theme-picker-styles]')) {
  style.setAttribute('data-radix-theme-picker-styles', 'true');
  document.head.appendChild(style);
}
