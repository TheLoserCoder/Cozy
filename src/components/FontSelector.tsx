import * as React from "react";
import { Box, Text, TextField, Select } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { FONT_OPTIONS, FontOption, getFontOption } from "../data/fonts";

interface FontSelectorProps {
  value: string;
  onValueChange: (fontId: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  value,
  onValueChange
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Фильтруем шрифты по поисковому запросу
  const filteredFonts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return FONT_OPTIONS;
    }
    
    const query = searchQuery.toLowerCase();
    return FONT_OPTIONS.filter(font => 
      font.name.toLowerCase().includes(query) ||
      font.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedFont = getFontOption(value);

  const handleFontSelect = (fontId: string) => {
    onValueChange(fontId);
    setIsOpen(false);
    setSearchQuery(""); // Очищаем поиск после выбора
  };

  // Группируем шрифты по категориям для лучшей организации
  const fontsByCategory = React.useMemo(() => {
    const grouped: Record<string, FontOption[]> = {};
    
    filteredFonts.forEach(font => {
      if (!grouped[font.category]) {
        grouped[font.category] = [];
      }
      grouped[font.category].push(font);
    });
    
    return grouped;
  }, [filteredFonts]);

  const categoryNames = {
    'sans-serif': 'Без засечек',
    'serif': 'С засечками',
    'monospace': 'Моноширинные',
    'display': 'Декоративные',
    'handwriting': 'Рукописные',
    'pixel': 'Пиксельные',
    'terminal': 'Терминальные'
  };

  // Закрытие при клике вне компонента
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Box ref={containerRef} style={{ position: 'relative' }}>
      <Text size="2" mb="2" weight="medium" as="div">
        Шрифт
      </Text>
      
      {/* Показываем текущий выбранный шрифт */}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          border: '1px solid var(--gray-6)',
          borderRadius: 'var(--radius-2)',
          backgroundColor: 'var(--color-surface)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-6)';
        }}
      >
        <Text 
          size="2" 
          style={{ 
            fontFamily: selectedFont.fallback,
            color: 'var(--gray-12)'
          }}
        >
          {selectedFont.name}
        </Text>
      </Box>

      {/* Выпадающий список с поиском */}
      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            zIndex: 10000,
            backgroundColor: 'var(--color-panel-solid)',
            border: '1px solid var(--gray-7)',
            borderRadius: 'var(--radius-3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxHeight: '400px',
            overflow: 'hidden',
            marginTop: '4px'
          }}
        >
          {/* Поле поиска */}
          <Box style={{ padding: '8px', borderBottom: '1px solid var(--gray-6)' }}>
            <TextField.Root
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск шрифтов..."
              size="2"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* Список шрифтов */}
          <Box
            style={{
              maxHeight: '320px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <Box key={category} style={{ marginBottom: '8px' }}>
                {/* Заголовок категории */}
                <Text 
                  size="1" 
                  weight="medium" 
                  color="gray"
                  style={{ 
                    padding: '4px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </Text>
                
                {/* Шрифты в категории */}
                {fonts.map((font) => (
                  <Box
                    key={font.id}
                    onClick={() => handleFontSelect(font.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-2)',
                      transition: 'background-color 0.15s ease',
                      backgroundColor: font.id === value ? 'var(--accent-3)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (font.id !== value) {
                        e.currentTarget.style.backgroundColor = 'var(--gray-3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (font.id !== value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Box>
                      <Text 
                        size="2" 
                        style={{ 
                          fontFamily: font.fallback,
                          color: 'var(--gray-12)',
                          fontWeight: font.id === value ? '500' : '400'
                        }}
                      >
                        {font.name}
                      </Text>
                      {font.googleFont && (
                        <Text size="1" color="gray" style={{ marginLeft: '8px' }}>
                          Google Font
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
            
            {filteredFonts.length === 0 && (
              <Box style={{ padding: '16px', textAlign: 'center' }}>
                <Text size="2" color="gray">
                  Шрифты не найдены
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
