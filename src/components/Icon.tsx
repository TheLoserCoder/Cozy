import * as React from "react";
import { Box, Text } from "@radix-ui/themes";
import * as RadixIcons from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { getBootstrapIconSvg } from "../utils/bootstrapIcons";

interface SvgIconProps {
  svgString: string;
  color?: string;
  size?: number;
}

const SvgIcon: React.FC<SvgIconProps> = ({ svgString, color, size = 16 }) => {
  const svgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (svgRef.current && svgString) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        
        if (svgElement) {
          svgElement.setAttribute('width', size.toString());
          svgElement.setAttribute('height', size.toString());
          svgElement.style.maxWidth = size + 'px';
          svgElement.style.maxHeight = size + 'px';
          svgElement.style.objectFit = 'contain';
          
          if (color) {
            svgElement.style.color = color;
            svgElement.setAttribute('fill', 'currentColor');
          }
          
          svgRef.current.innerHTML = '';
          svgRef.current.appendChild(svgElement);
        }
      } catch (error) {
        console.error('Error parsing SVG:', error);
      }
    }
  }, [svgString, color, size]);

  return (
    <div 
      ref={svgRef} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: size,
        height: size,
        overflow: 'hidden'
      }} 
    />
  );
};

interface IconProps {
  iconId?: string | null;
  iconType?: 'standard' | 'custom' | 'favicon';
  fallbackText?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  iconId,
  iconType = 'favicon',
  fallbackText,
  color,
  size = 16,
  style = {}
}) => {
  const [iconData, setIconData] = React.useState<{ type: 'image' | 'svg'; data: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [bootstrapIcon, setBootstrapIcon] = React.useState<string | null>(null);

  // Получаем иконку из хранилища
  React.useEffect(() => {
    if (!iconId || iconType === 'favicon') {
      setIconData(null);
      return;
    }

    if (iconType === 'standard') {
      // Стандартные иконки не требуют загрузки
      setIconData(null);
      return;
    }

    // Загружаем пользовательские иконки из IndexedDB через worker
    const loadIcon = async () => {
      setLoading(true);
      try {
        // Сначала пробуем загрузить как Bootstrap иконку
        const bootstrapSvg = await getBootstrapIconSvg(iconId);
        if (bootstrapSvg) {
          setBootstrapIcon(bootstrapSvg);
          setLoading(false);
          return;
        }
        
        // Если не Bootstrap иконка, загружаем из хранилища
        const port = chrome?.runtime?.connect({ name: 'icon-manager' });
        if (port) {
          port.postMessage({
            type: 'GET_ICON',
            iconId
          });
          port.onMessage.addListener((response) => {
            if (response.success && response.icon) {
              setIconData({
                type: response.icon.type,
                data: response.icon.data
              });
            }
            setLoading(false);
            port.disconnect();
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading icon:', error);
        setLoading(false);
      }
    };

    loadIcon();
  }, [iconId, iconType]);

  // Если это стандартная иконка
  if (iconType === 'standard' && iconId) {
    const IconComponent = (RadixIcons as any)[iconId];
    if (IconComponent) {
      return (
        <IconComponent
          style={{
            width: size,
            height: size,
            color: color || 'currentColor',
            ...style
          }}
        />
      );
    }
  }

  // Если это Bootstrap иконка
  if (bootstrapIcon) {
    return (
      <SvgIcon
        svgString={bootstrapIcon}
        color={color}
        size={size}
      />
    );
  }

  // Если это пользовательская иконка
  if (iconData) {
    if (iconData.type === 'svg') {
      return (
        <SvgIcon
          svgString={iconData.data}
          color={color}
          size={size}
        />
      );
    } else {
      return (
        <img
          src={iconData.data}
          alt=""
          style={{
            width: size,
            height: size,
            objectFit: 'contain',
            ...style
          }}
        />
      );
    }
  }

  // Если загружается
  if (loading) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <Text size="1" style={{ color: '#999' }}>...</Text>
      </Box>
    );
  }

  // Fallback - первая буква текста
  if (fallbackText) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(8, size * 0.6),
          fontWeight: 'bold',
          color: color || '#666',
          ...style
        }}
      >
        {fallbackText.charAt(0).toUpperCase()}
      </Box>
    );
  }

  return null;
};