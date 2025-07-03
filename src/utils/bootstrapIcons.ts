import * as React from 'react';

// Кэш для загруженных данных
let bootstrapIconsData: Record<string, string> | null = null;
let allBootstrapIcons: string[] | null = null;

// Загружаем данные иконок
const loadBootstrapIconsData = async (): Promise<Record<string, string>> => {
  if (bootstrapIconsData) return bootstrapIconsData;
  
  try {
    // Используем динамический импорт для dev режима
    const dataModule = await import('/bootstrap-icons-data.json?url');
    const response = await fetch(dataModule.default);
    if (response.ok) {
      bootstrapIconsData = await response.json();
      return bootstrapIconsData || {};
    }
  } catch (error) {
    // Fallback для production
    try {
      const response = await fetch('/bootstrap-icons-data.json');
      if (response.ok) {
        bootstrapIconsData = await response.json();
        return bootstrapIconsData || {};
      }
    } catch (fallbackError) {
      console.error('Failed to load Bootstrap icons data:', error, fallbackError);
    }
  }
  
  return {};
};

// Загружаем список всех иконок
const loadAllBootstrapIcons = async (): Promise<string[]> => {
  if (allBootstrapIcons) return allBootstrapIcons;
  
  try {
    const listModule = await import('/bootstrap-icons-list.json?url');
    const response = await fetch(listModule.default);
    if (response.ok) {
      allBootstrapIcons = await response.json();
      return allBootstrapIcons || [];
    }
  } catch (error) {
    // Fallback для production
    try {
      const response = await fetch('/bootstrap-icons-list.json');
      if (response.ok) {
        allBootstrapIcons = await response.json();
        return allBootstrapIcons || [];
      }
    } catch (fallbackError) {
      console.error('Failed to load Bootstrap icons list:', error, fallbackError);
    }
  }
  
  return [];
};

// Получаем популярные иконки из загруженных данных
export const getPopularBootstrapIcons = async (): Promise<string[]> => {
  const data = await loadBootstrapIconsData();
  return Object.keys(data);
};

export type BootstrapIconName = string;

export type BootstrapIconName = typeof BOOTSTRAP_ICONS[number];

// Функция для получения SVG иконки Bootstrap
export const getBootstrapIconSvg = async (iconName: string): Promise<string | null> => {
  try {
    const data = await loadBootstrapIconsData();
    return data[iconName] || null;
  } catch (error) {
    console.error(`Failed to load Bootstrap icon: ${iconName}`, error);
    return null;
  }
};

// Функция для поиска иконок по названию
export const searchBootstrapIcons = async (query: string): Promise<string[]> => {
  const allIcons = await loadAllBootstrapIcons();
  
  if (!query.trim()) {
    // Возвращаем сначала популярные, потом остальные
    const popularIcons = await getPopularBootstrapIcons();
    const otherIcons = allIcons.filter(icon => !popularIcons.includes(icon));
    return [...popularIcons, ...otherIcons.slice(0, 200)]; // Ограничиваем количество
  }
  
  const searchTerm = query.toLowerCase();
  return allIcons.filter(icon => 
    icon.toLowerCase().includes(searchTerm)
  ).slice(0, 100); // Ограничиваем результаты поиска
};

// Интерфейс для пропсов компонента BootstrapIcon
interface BootstrapIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Компонент для отображения Bootstrap иконки
export const BootstrapIcon: React.FC<BootstrapIconProps> = ({ name, size = 16, className, style }) => {
  const [svgContent, setSvgContent] = React.useState<string>('');
  
  React.useEffect(() => {
    getBootstrapIconSvg(name).then(svg => {
      if (svg) {
        setSvgContent(svg);
      }
    });
  }, [name]);
  
  if (!svgContent) {
    return React.createElement('div', {
      style: { width: size, height: size, ...style },
      className: className
    });
  }
  
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: svgContent },
    style: { width: size, height: size, ...style },
    className: className
  });
};