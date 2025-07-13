import * as React from "react";
import { Box, Text } from "@radix-ui/themes";
import * as RadixIcons from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { getBootstrapIconSvg } from "../utils/bootstrapIcons";
import { getGlobalIcon, addIconListener } from "../utils/globalIconCache";

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
  const globalIcon = iconId ? getGlobalIcon(iconId) : null;
  const [iconData, setIconData] = React.useState<{ type: 'image' | 'svg'; data: string } | null>(globalIcon);
  const [loading, setLoading] = React.useState(false);
  const [bootstrapIcon, setBootstrapIcon] = React.useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = React.useState(0);

  // Слушатель обновлений глобального кэша
  React.useEffect(() => {
    if (!iconId) return;
    
    return addIconListener((updatedIconId, iconData) => {
      if (updatedIconId === iconId) {
        setIconData(iconData);
        setLoading(false);
        setForceUpdate(prev => prev + 1);
      }
    });
  }, [iconId]);

  React.useEffect(() => {
    if (!iconId || iconType === 'standard') {
      setLoading(false);
      return;
    }

    // Проверяем глобальный кэш еще раз
    const cachedIcon = getGlobalIcon(iconId);
    if (cachedIcon) {
      setIconData(cachedIcon);
      setLoading(false);
      return;
    }

    setLoading(true);
    const loadIcon = async () => {
      try {
        const bootstrapSvg = await getBootstrapIconSvg(iconId);
        if (bootstrapSvg) {
          setBootstrapIcon(bootstrapSvg);
          setLoading(false);
          return;
        }
        
        // Если это favicon и нет в кэше, запрашиваем загрузку
        if (iconType === 'favicon' && typeof chrome !== 'undefined' && chrome.runtime) {
          try {
            const port = chrome.runtime.connect({ name: 'icon-manager' });
            port.postMessage({ 
              type: 'GET_ICON', 
              iconId 
            });
            
            port.onMessage.addListener((response) => {
              if (response.success && response.icon) {
                const iconData = { type: response.icon.type, data: response.icon.data };
                setIconData(iconData);
                setForceUpdate(prev => prev + 1);
              }
              setLoading(false);
              port.disconnect();
            });
          } catch (error) {
            console.error('Error loading icon from storage:', error);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading icon:', error);
        setLoading(false);
      }
    };

    loadIcon();
  }, [iconId, iconType, forceUpdate]);

  // Мгновенное отображение из глобального кэша
  if (globalIcon || iconData) {
    const icon = globalIcon || iconData;
    if (icon.type === 'svg') {
      return (
        <SvgIcon
          svgString={icon.data}
          color={color}
          size={size}
        />
      );
    } else {
      return (
        <img
          src={icon.data}
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

  // Стандартные иконки
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

  // Bootstrap иконки
  if (bootstrapIcon) {
    return (
      <SvgIcon
        svgString={bootstrapIcon}
        color={color}
        size={size}
      />
    );
  }

  // Иконки из состояния (загруженные асинхронно)
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