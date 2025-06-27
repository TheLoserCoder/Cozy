import * as React from "react";
import { Box } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "../store/hooks";
import { getSearchEngine } from "../data/searchEngines";

export const SearchBox: React.FC = () => {
  const { search, radixTheme } = useAppSelector((state) => state.theme);
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Не отображаем поисковик, если он скрыт
  if (!search.visible) {
    return null;
  }

  const searchEngine = getSearchEngine(search.searchEngine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = searchEngine.url + encodeURIComponent(query.trim());
      window.open(searchUrl, '_blank');
      setQuery(""); // Очищаем поле после поиска
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Определяем цвета с учетом настроек
  const backgroundColor = search.backgroundColor || 'rgba(255, 255, 255, 0.1)';
  const borderColor = search.borderColor || radixTheme || 'var(--accent-9)';
  const textColor = search.textColor || '#FFFFFF';

  // Размер поисковика
  const scale = search.size || 1.0;
  const baseWidth = 600;
  const basePadding = 16;
  const baseFontSize = 16;
  const baseIconSize = 20;

  const scaledWidth = baseWidth * scale;
  const scaledPadding = basePadding * scale;
  const scaledFontSize = baseFontSize * scale;
  const scaledIconSize = baseIconSize * scale;

  return (
    <Box
      className="search-box"
      style={{
        width: '100%',
        maxWidth: `${scaledWidth}px`,
        margin: '0 auto',
        padding: `0 ${scaledPadding}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center'
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={searchEngine.placeholder}
            style={{
              width: '100%',
              backgroundColor: backgroundColor,
              borderColor: isFocused ? borderColor : `${borderColor}80`,
              color: textColor,
              fontSize: `${scaledFontSize}px`,
              padding: `${12 * scale}px ${50 * scale}px ${12 * scale}px ${16 * scale}px`,
              borderRadius: 'var(--radius-6)', // Используем скругление темы Radix
              border: `2px solid ${isFocused ? borderColor : `${borderColor}80`}`,
              outline: 'none',
              transition: 'all 0.2s ease',
              backdropFilter: search.backdropBlur ? 'blur(10px)' : 'none',
              fontFamily: 'var(--default-font-family)',
              boxShadow: isFocused ? `0 0 0 1px ${borderColor}` : 'none'
            }}
            // Стили для placeholder
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.setProperty('--placeholder-color', `${textColor}80`);
            }}
          />
          <Box
            style={{
              position: 'absolute',
              right: `${16 * scale}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: textColor,
              opacity: 0.7,
              transition: 'opacity 0.2s ease',
              padding: `${4 * scale}px`
            }}
            onClick={handleSubmit}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            <MagnifyingGlassIcon style={{ width: scaledIconSize, height: scaledIconSize }} />
          </Box>
        </Box>
      </form>

      {/* Стили для placeholder */}
      <style>
        {`
          input::placeholder {
            color: ${textColor}80;
            opacity: 1;
          }
          input::-webkit-input-placeholder {
            color: ${textColor}80;
            opacity: 1;
          }
          input::-moz-placeholder {
            color: ${textColor}80;
            opacity: 1;
          }
          input:-ms-input-placeholder {
            color: ${textColor}80;
            opacity: 1;
          }
        `}
      </style>
    </Box>
  );
};
