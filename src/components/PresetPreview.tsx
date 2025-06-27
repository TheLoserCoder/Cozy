import * as React from "react";
import { Box, Text } from "@radix-ui/themes";
import { Preset } from "../store/themeSlice";
import { getFontOption } from "../data/fonts";

interface PresetPreviewProps {
  preset: Preset;
  size?: 'small' | 'medium';
}

export const PresetPreview: React.FC<PresetPreviewProps> = ({ 
  preset, 
  size = 'medium' 
}) => {
  const { data } = preset;
  const fontOption = getFontOption(data.font.fontFamily);
  
  const dimensions = size === 'small' ? { width: 40, height: 30 } : { width: 60, height: 45 };
  
  // Определяем фон для превью
  const getBackgroundStyle = () => {
    const { background } = data;
    
    switch (background.type) {
      case 'image':
        return {
          backgroundImage: `url(${background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'gradient':
        return {
          background: background.value
        };
      case 'solid':
      default:
        return {
          backgroundColor: background.value || data.colors.accent || '#86EFAC'
        };
    }
  };

  // Определяем цвет текста для хорошей видимости
  const getTextColor = () => {
    // Для изображений используем цвет часов
    if (data.background.type === 'image') {
      return data.clock.color || '#FFFFFF';
    }
    
    // Для градиентов и сплошных цветов используем контрастный цвет
    const bgColor = data.background.value || data.colors.accent || '#86EFAC';
    
    // Простая проверка яркости цвета
    if (bgColor.includes('rgb') || bgColor.includes('#')) {
      // Для простоты используем цвет часов или белый
      return data.clock.color || '#FFFFFF';
    }
    
    return data.clock.color || '#FFFFFF';
  };

  return (
    <Box
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: 'var(--radius-2)',
        border: '1px solid var(--gray-6)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...getBackgroundStyle()
      }}
    >
      {/* Overlay для лучшей читаемости текста */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1
        }}
      />
      
      {/* Буква T в стиле выбранного шрифта */}
      <Text
        style={{
          fontFamily: fontOption.fallback,
          fontSize: size === 'small' ? '16px' : '24px',
          fontWeight: '600',
          color: getTextColor(),
          zIndex: 2,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          // Специальные стили для пиксельных шрифтов
          ...(fontOption.category === 'pixel' ? {
            imageRendering: 'pixelated',
            fontSmooth: 'never',
            WebkitFontSmoothing: 'none'
          } : {})
        }}
      >
        T
      </Text>
    </Box>
  );
};
