export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting' | 'pixel' | 'terminal';
  googleFont?: boolean;
  fallback: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // Системные шрифты
  {
    id: 'system-ui',
    name: 'System font',
    family: 'system-ui',
    category: 'sans-serif',
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  {
    id: 'arial',
    name: 'Arial',
    family: 'Arial',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    id: 'helvetica',
    name: 'Helvetica',
    family: 'Helvetica',
    category: 'sans-serif',
    fallback: 'Helvetica, Arial, sans-serif'
  },
  {
    id: 'times',
    name: 'Times New Roman',
    family: 'Times New Roman',
    category: 'serif',
    fallback: '"Times New Roman", Times, serif'
  },
  {
    id: 'georgia',
    name: 'Georgia',
    family: 'Georgia',
    category: 'serif',
    fallback: 'Georgia, serif'
  },
  {
    id: 'courier',
    name: 'Courier New',
    family: 'Courier New',
    category: 'monospace',
    fallback: '"Courier New", Courier, monospace'
  },
  {
    id: 'verdana',
    name: 'Verdana',
    family: 'Verdana',
    category: 'sans-serif',
    fallback: 'Verdana, sans-serif'
  },
  
  // Google Fonts
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Roboto, sans-serif'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    family: 'Open Sans',
    category: 'sans-serif',
    googleFont: true,
    fallback: '"Open Sans", sans-serif'
  },
  {
    id: 'lato',
    name: 'Lato',
    family: 'Lato',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Lato, sans-serif'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Montserrat, sans-serif'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: 'Poppins',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Poppins, sans-serif'
  },
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Inter, sans-serif'
  },
  {
    id: 'source-sans-pro',
    name: 'Source Sans Pro',
    family: 'Source Sans Pro',
    category: 'sans-serif',
    googleFont: true,
    fallback: '"Source Sans Pro", sans-serif'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    family: 'Nunito',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Nunito, sans-serif'
  },
  {
    id: 'raleway',
    name: 'Raleway',
    family: 'Raleway',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Raleway, sans-serif'
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    family: 'Ubuntu',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Ubuntu, sans-serif'
  },
  
  // Serif шрифты
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: 'Playfair Display',
    category: 'serif',
    googleFont: true,
    fallback: '"Playfair Display", serif'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    family: 'Merriweather',
    category: 'serif',
    googleFont: true,
    fallback: 'Merriweather, serif'
  },
  {
    id: 'lora',
    name: 'Lora',
    family: 'Lora',
    category: 'serif',
    googleFont: true,
    fallback: 'Lora, serif'
  },
  
  // Monospace шрифты
  {
    id: 'fira-code',
    name: 'Fira Code',
    family: 'Fira Code',
    category: 'monospace',
    googleFont: true,
    fallback: '"Fira Code", monospace'
  },
  {
    id: 'source-code-pro',
    name: 'Source Code Pro',
    family: 'Source Code Pro',
    category: 'monospace',
    googleFont: true,
    fallback: '"Source Code Pro", monospace'
  },
  
  // Display шрифты
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: 'Dancing Script',
    category: 'handwriting',
    googleFont: true,
    fallback: '"Dancing Script", cursive'
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    family: 'Pacifico',
    category: 'handwriting',
    googleFont: true,
    fallback: 'Pacifico, cursive'
  },

  // Пиксельные шрифты
  {
    id: 'press-start-2p',
    name: 'Press Start 2P',
    family: 'Press Start 2P',
    category: 'pixel',
    googleFont: true,
    fallback: '"Press Start 2P", monospace'
  },
  {
    id: 'orbitron',
    name: 'Orbitron',
    family: 'Orbitron',
    category: 'pixel',
    googleFont: true,
    fallback: 'Orbitron, monospace'
  },
  {
    id: 'vt323',
    name: 'VT323',
    family: 'VT323',
    category: 'pixel',
    googleFont: true,
    fallback: 'VT323, monospace'
  },
  {
    id: 'share-tech-mono',
    name: 'Share Tech Mono',
    family: 'Share Tech Mono',
    category: 'pixel',
    googleFont: true,
    fallback: '"Share Tech Mono", monospace'
  },
  {
    id: 'major-mono-display',
    name: 'Major Mono Display',
    family: 'Major Mono Display',
    category: 'pixel',
    googleFont: true,
    fallback: '"Major Mono Display", monospace'
  },
  {
    id: 'silkscreen',
    name: 'Silkscreen',
    family: 'Silkscreen',
    category: 'pixel',
    googleFont: true,
    fallback: 'Silkscreen, monospace'
  },
  {
    id: 'pixelify-sans',
    name: 'Pixelify Sans',
    family: 'Pixelify Sans',
    category: 'pixel',
    googleFont: true,
    fallback: '"Pixelify Sans", monospace'
  },
  {
    id: 'bungee',
    name: 'Bungee',
    family: 'Bungee',
    category: 'pixel',
    googleFont: true,
    fallback: 'Bungee, monospace'
  },
  {
    id: 'audiowide',
    name: 'Audiowide',
    family: 'Audiowide',
    category: 'pixel',
    googleFont: true,
    fallback: 'Audiowide, monospace'
  },

  // Терминальные шрифты
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: 'JetBrains Mono',
    category: 'terminal',
    googleFont: true,
    fallback: '"JetBrains Mono", monospace'
  },
  {
    id: 'ubuntu-mono',
    name: 'Ubuntu Mono',
    family: 'Ubuntu Mono',
    category: 'terminal',
    googleFont: true,
    fallback: '"Ubuntu Mono", monospace'
  },
  {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    family: 'Roboto Mono',
    category: 'terminal',
    googleFont: true,
    fallback: '"Roboto Mono", monospace'
  },
  {
    id: 'inconsolata',
    name: 'Inconsolata',
    family: 'Inconsolata',
    category: 'terminal',
    googleFont: true,
    fallback: 'Inconsolata, monospace'
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    family: 'Space Mono',
    category: 'terminal',
    googleFont: true,
    fallback: '"Space Mono", monospace'
  },
  {
    id: 'anonymous-pro',
    name: 'Anonymous Pro',
    family: 'Anonymous Pro',
    category: 'terminal',
    googleFont: true,
    fallback: '"Anonymous Pro", monospace'
  },
  {
    id: 'pt-mono',
    name: 'PT Mono',
    family: 'PT Mono',
    category: 'terminal',
    googleFont: true,
    fallback: '"PT Mono", monospace'
  },
  {
    id: 'cousine',
    name: 'Cousine',
    family: 'Cousine',
    category: 'terminal',
    googleFont: true,
    fallback: 'Cousine, monospace'
  },

  // Дополнительные современные шрифты
  {
    id: 'work-sans',
    name: 'Work Sans',
    family: 'Work Sans',
    category: 'sans-serif',
    googleFont: true,
    fallback: '"Work Sans", sans-serif'
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    family: 'DM Sans',
    category: 'sans-serif',
    googleFont: true,
    fallback: '"DM Sans", sans-serif'
  },
  {
    id: 'manrope',
    name: 'Manrope',
    family: 'Manrope',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Manrope, sans-serif'
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: 'Outfit',
    category: 'sans-serif',
    googleFont: true,
    fallback: 'Outfit, sans-serif'
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    family: 'Plus Jakarta Sans',
    category: 'sans-serif',
    googleFont: true,
    fallback: '"Plus Jakarta Sans", sans-serif'
  },

  // Дополнительные декоративные шрифты
  {
    id: 'righteous',
    name: 'Righteous',
    family: 'Righteous',
    category: 'display',
    googleFont: true,
    fallback: 'Righteous, cursive'
  },
  {
    id: 'fredoka-one',
    name: 'Fredoka One',
    family: 'Fredoka One',
    category: 'display',
    googleFont: true,
    fallback: '"Fredoka One", cursive'
  },
  {
    id: 'comfortaa',
    name: 'Comfortaa',
    family: 'Comfortaa',
    category: 'display',
    googleFont: true,
    fallback: 'Comfortaa, cursive'
  }
];

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find(font => font.id === id) || FONT_OPTIONS[0];
}

export function loadGoogleFont(fontFamily: string): void {
  // Проверяем, не загружен ли уже шрифт
  const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
  if (existingLink) return;

  // Создаем ссылку на Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function applyFontToDocument(fontOption: FontOption): void {
  // Загружаем Google Font если необходимо
  if (fontOption.googleFont) {
    loadGoogleFont(fontOption.family);
  }

  // Применяем шрифт к документу через CSS переменные
  document.documentElement.style.setProperty('--app-font-family', fontOption.fallback);

  // Также применяем к основным компонентам
  const style = document.createElement('style');
  style.id = 'app-font-styles';

  // Удаляем предыдущие стили если есть
  const existingStyle = document.getElementById('app-font-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  style.textContent = `
    /* Устанавливаем CSS переменную для шрифта */
    :root {
      --app-font-family: ${fontOption.fallback};
    }

    /* Применяем шрифт к основным компонентам */
    .clock-component,
    .clock-component *,
    .clock-component h1,
    .clock-component h2,
    .clock-component h3,
    .clock-component h4,
    .clock-component h5,
    .clock-component h6,
    .clock-component p,
    .clock-component span,
    .clock-component div,
    .search-box input,
    .search-box *,
    .list-title,
    .list-title *,
    .list-item,
    .list-item *,
    .list-item a,
    [data-radix-themes] .clock-component *,
    [data-radix-themes] .search-box *,
    [data-radix-themes] .list-title *,
    [data-radix-themes] .list-item * {
      font-family: ${fontOption.fallback} !important;
    }

    /* Специальные стили для пиксельных шрифтов */
    ${fontOption.category === 'pixel' ? `
    .clock-component,
    .clock-component *,
    .search-box input,
    .search-box *,
    .list-title,
    .list-title *,
    .list-item,
    .list-item *,
    .list-item a {
      image-rendering: pixelated !important;
      image-rendering: -moz-crisp-edges !important;
      image-rendering: crisp-edges !important;
      font-smooth: never !important;
      -webkit-font-smoothing: none !important;
    }
    ` : ''}
  `;

  document.head.appendChild(style);
}
