import * as React from "react";
import { Box, Flex, Text, IconButton, ScrollArea, TextField, Tabs, Button } from "@radix-ui/themes";
import { UpdateIcon, MagnifyingGlassIcon, PlusIcon, UploadIcon, Link1Icon, TrashIcon } from "@radix-ui/react-icons";
import { ActionIconButton } from "./ActionButtons";
import { CustomPopover } from "./CustomPopover";
import { SettingsThemeProvider } from "./ThemeProvider";
import { useTranslation } from "../locales";
import { nanoid } from "nanoid";
import { getBootstrapIconSvg, searchBootstrapIcons, getPopularBootstrapIcons } from "../utils/bootstrapIcons";
import { Grid } from 'react-virtualized';
import 'react-virtualized/styles.css';

const BootstrapIconRenderer: React.FC<{
  iconName: string;
  cache: Record<string, string>;
  onLoad: (iconName: string) => Promise<void>;
}> = ({ iconName, cache, onLoad }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (!cache[iconName] && !isLoading) {
      setIsLoading(true);
      onLoad(iconName).finally(() => setIsLoading(false));
    }
  }, [iconName, cache, onLoad, isLoading]);
  
  if (cache[iconName]) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: cache[iconName] }} 
        style={{ width: 18, height: 18 }} 
      />
    );
  }
  
  return (
    <div style={{ width: 18, height: 18, backgroundColor: 'var(--gray-3)', borderRadius: '2px' }} />
  );
};



interface IconPickerProps {
  value?: string;
  iconId?: string;
  iconType?: 'standard' | 'custom';
  onChange?: (iconName: string | undefined) => void;
  onIconChange?: (iconId: string | null, iconType: 'standard' | 'custom' | null) => void;
  onReset?: () => void;
  label?: string;
  showReset?: boolean;
  disabled?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  iconId,
  iconType,
  onChange,
  onIconChange,
  onReset,
  label,
  showReset = false,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = React.useState('bootstrap');
  const [customIcons, setCustomIcons] = React.useState<any[]>([]);
  const [newIconUrl, setNewIconUrl] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [bootstrapIconsCache, setBootstrapIconsCache] = React.useState<Record<string, string>>({});
  const [filteredBootstrapIcons, setFilteredBootstrapIcons] = React.useState<string[]>([]);
  const [isLoadingBootstrapIcons, setIsLoadingBootstrapIcons] = React.useState(false);

  const { t } = useTranslation();

  // Дебаунс для поиска
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

// Загружаем пользовательские иконки
React.useEffect(() => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const port = chrome.runtime.connect({ name: 'icon-manager' });
    if (port) {
      port.postMessage({ type: 'EXPORT_ALL_DATA' });
      port.onMessage.addListener((response) => {
        if (response.success && response.icons) {
          setCustomIcons(response.icons);
        }
        port.disconnect();
      });
    }
  }
}, []);

  // Предзагружаем популярные Bootstrap иконки
  React.useEffect(() => {
    const loadPopularIcons = async () => {
      try {
        const popularIcons = await getPopularBootstrapIcons();
        const cache: Record<string, string> = {};
        
        for (const iconName of popularIcons.slice(0, 50)) {
          try {
            const svg = await getBootstrapIconSvg(iconName);
            if (svg) {
              cache[iconName] = svg;
            }
          } catch (error) {
            console.warn(`Failed to load Bootstrap icon: ${iconName}`);
          }
        }
        
        setBootstrapIconsCache(cache);
      } catch (error) {
        console.error('Failed to load popular Bootstrap icons:', error);
      }
    };
    
    loadPopularIcons();
  }, []);

  // Загружаем Bootstrap иконку по требованию
  const loadBootstrapIcon = async (iconName: string) => {
    if (bootstrapIconsCache[iconName]) return;
    
    const svg = await getBootstrapIconSvg(iconName);
    if (svg) {
      setBootstrapIconsCache(prev => ({ ...prev, [iconName]: svg }));
    }
  };



  // Добавление иконки по URL
  const handleAddIconFromUrl = async () => {
    if (!newIconUrl.trim()) return;
    
    try {
      const iconId = nanoid();
      const url = newIconUrl.trim();
      
      // Определяем тип по расширению URL
      const isSvg = url.toLowerCase().includes('.svg') || url.toLowerCase().includes('svg');
      
      let iconData = url;
      let iconType = 'image';
      
      // Если это SVG, загружаем содержимое
      if (isSvg) {
        try {
          const response = await fetch(url);
          const svgContent = await response.text();
          iconData = svgContent;
          iconType = 'svg';
        } catch (error) {
          console.warn('Failed to fetch SVG content, using URL instead:', error);
        }
      }
      
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const port = chrome.runtime.connect({ name: 'icon-manager' });
  if (port) {
    port.postMessage({
      type: 'SAVE_CUSTOM_ICON',
      icon: {
        id: iconId,
        name: 'Custom Icon',
        type: iconType,
        data: iconData,
        addedAt: Date.now()
      }
    });
    
    port.onMessage.addListener((response) => {
      if (response.success) {
        setNewIconUrl('');
        // Обновляем список иконок
        setTimeout(() => {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            const port2 = chrome.runtime.connect({ name: 'icon-manager' });
            if (port2) {
              port2.postMessage({ type: 'EXPORT_ALL_DATA' });
              port2.onMessage.addListener((response2) => {
                if (response2.success && response2.icons) {
                  setCustomIcons(response2.icons);
                }
                port2.disconnect();
              });
            }
          }
        }, 100);
      }
      port.disconnect();
    });
  }
}
    } catch (error) {
      console.error('Error adding icon:', error);
    }
  };

  // Загрузка файла иконки
// Удаление иконки
const handleDeleteIcon = (iconId: string) => {
  if (confirm(t('iconPicker.deleteConfirm'))) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const port = chrome.runtime.connect({ name: 'icon-manager' });
      if (port) {
        port.postMessage({
          type: 'DELETE_CUSTOM_ICON',
          iconId: iconId
        });
        
        port.onMessage.addListener((response) => {
          if (response.success) {
            setCustomIcons(prev => prev.filter(icon => icon.id !== iconId));
          }
          port.disconnect();
        });
      }
    }
  }
};

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("upload icon")
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        const iconId = nanoid();
const iconType = file.type.includes('svg') ? 'svg' : 'image';
        
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const port = chrome.runtime.connect({ name: 'icon-manager' });
  if (port) {
    port.postMessage({
      type: 'SAVE_CUSTOM_ICON',
      icon: {
        id: iconId,
        name: file.name,
        type: iconType,
        data: result,
        addedAt: Date.now()
      }
    });
    
    port.onMessage.addListener((response) => {
      if (response.success) {
        const newIcon = {
          id: iconId,
          name: file.name,
          type: iconType,
          data: result
        };
        setCustomIcons(prev => [...prev, newIcon]);
        // Обновляем список иконок
        setTimeout(() => {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            const port2 = chrome.runtime.connect({ name: 'icon-manager' });
            if (port2) {
              port2.postMessage({ type: 'EXPORT_ALL_DATA' });
              port2.onMessage.addListener((response2) => {
                if (response2.success && response2.icons) {
                  setCustomIcons(response2.icons);
                }
                port2.disconnect();
              });
            }
          }
        }, 100);
      }
      port.disconnect();
    });
  }
}
      }
    };
    
    if (file.type.includes('svg')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };



  const handleIconSelect = (iconName: string, type: 'bootstrap' | 'custom' = 'bootstrap', id?: string) => {
    if (type === 'bootstrap') {
      onChange?.(undefined);
      onIconChange?.(iconName, 'custom'); // Сохраняем как custom с именем Bootstrap иконки
    } else {
      onChange?.(undefined);
      onIconChange?.(id || null, type);
    }
  };

  const handleReset = () => {
    onChange?.(undefined);
    onIconChange?.(null, null);
    onReset?.();
  };

  const customIcon = iconType === 'custom' && iconId ? customIcons.find(icon => icon.id === iconId) : null;
  const bootstrapIcon = iconType === 'custom' && iconId && bootstrapIconsCache[iconId] ? bootstrapIconsCache[iconId] : null;
  
  // Загружаем Bootstrap иконку для отображения в триггере
  React.useEffect(() => {
    if (iconType === 'custom' && iconId && !bootstrapIconsCache[iconId] && !customIcon) {
      loadBootstrapIcon(iconId);
    }
  }, [iconType, iconId, bootstrapIconsCache, customIcon]);
  
  // Поиск Bootstrap иконок
  React.useEffect(() => {
    const performSearch = async () => {
      setIsLoadingBootstrapIcons(true);
      try {
        const results = await searchBootstrapIcons(debouncedSearchQuery);
        setFilteredBootstrapIcons(results);
      } catch (error) {
        console.error('Failed to search Bootstrap icons:', error);
        setFilteredBootstrapIcons([]);
      } finally {
        setIsLoadingBootstrapIcons(false);
      }
    };
    
    performSearch();
  }, [debouncedSearchQuery]);
  
  // Инициализация Bootstrap иконок
  React.useEffect(() => {
    if (filteredBootstrapIcons.length === 0 && !isLoadingBootstrapIcons) {
      const initBootstrapIcons = async () => {
        setIsLoadingBootstrapIcons(true);
        try {
          const results = await searchBootstrapIcons('');
          setFilteredBootstrapIcons(results);
        } catch (error) {
          console.error('Failed to initialize Bootstrap icons:', error);
        } finally {
          setIsLoadingBootstrapIcons(false);
        }
      };
      
      initBootstrapIcons();
    }
  }, [filteredBootstrapIcons.length, isLoadingBootstrapIcons]);

  return (
    <Box>
      <Flex align="center" justify="between" gap="3" style={{ opacity: disabled ? 0.5 : 1 }}>
        {label && (
          <Text size="2" weight="medium" as="div" style={{ flex: 1 }}>
            {label}
          </Text>
        )}
        <Flex align="center" gap="2">
          <CustomPopover
            trigger={
              <Box
                style={{
                  width: "32px",
                  height: "32px",
                  border: "2px solid var(--gray-6)",
                  borderRadius: "50%",
                  cursor: disabled ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--gray-1)"
                }}
              >
                {bootstrapIcon ? (
                  <div dangerouslySetInnerHTML={{ __html: bootstrapIcon }} style={{ width: 16, height: 16 }} />
                ) : customIcon ? (
                  customIcon.type === 'svg' ? (
                    <div dangerouslySetInnerHTML={{ __html: customIcon.data }} style={{ width: 16, height: 16 }} />
                  ) : (
                    <img src={customIcon.data} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )
                ) : (
                  <Text size="1" style={{ color: "var(--gray-9)" }}>
                    ?
                  </Text>
                )}
              </Box>
            }
            content={
              <SettingsThemeProvider>
              <Box style={{ width: '100%', maxHeight: '600px' }}>
                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                  <Tabs.List style={{ marginBottom: '12px' }}>
<Tabs.Trigger value="bootstrap">{t('iconPicker.standard')}</Tabs.Trigger>
<Tabs.Trigger value="custom">{t('iconPicker.custom')}</Tabs.Trigger>
                  </Tabs.List>

                  {/* Поиск */}
                  <Box mb="3">
                    <TextField.Root
                      placeholder={activeTab === 'bootstrap' ? t('iconPicker.searchPlaceholderBootstrap') : t('iconPicker.searchPlaceholderCustom')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                      </TextField.Slot>
                      {searchQuery && (
                        <TextField.Slot>
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              color: 'var(--gray-9)'
                            }}
                          >
                            ✕
                          </button>
                        </TextField.Slot>
                      )}
                    </TextField.Root>
                    {activeTab === 'bootstrap' && !isLoadingBootstrapIcons && (
<Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
  {t('iconPicker.found')}: {filteredBootstrapIcons.length}
</Text>
                    )}
                    {activeTab === 'custom' && (
<Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
  {t('iconPicker.total')}: {customIcons.length}
</Text>
                    )}
                  </Box>

                  <Tabs.Content value="bootstrap">
                    <Box >
                      {isLoadingBootstrapIcons ? (
<Flex justify="center" align="center" style={{ height: '450px' }}>
  <Text size="2" color="gray">{t('common.loading')}</Text>
</Flex>
                      ) : filteredBootstrapIcons.length === 0 ? (
<Flex justify="center" align="center" style={{ height: '450px' }}>
  <Text size="2" color="gray">{t('iconPicker.notFound')}</Text>
</Flex>
                      ) : (
                        <Grid
                          columnCount={8}
                          columnWidth={44}
                          height={360}
                          rowCount={Math.ceil(filteredBootstrapIcons.length / 10)}
                          rowHeight={44}
                          width={370}
                          cellRenderer={({ columnIndex, rowIndex, style }) => {
                            const index = rowIndex * 10 + columnIndex;
                            if (index >= filteredBootstrapIcons.length) return null;
                            
                            const iconName = filteredBootstrapIcons[index];
                            const isSelected = iconId === iconName && iconType === 'custom';
                            
                            return (
                              <div style={style}>
                                <IconButton
                                  variant={isSelected ? "solid" : "soft"}
                                  color="gray"
                                  size="2"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    await loadBootstrapIcon(iconName);
                                    handleIconSelect(iconName, 'bootstrap');
                                  }}
                                  type="button"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "4px"
                                  }}
                                >
                                  <BootstrapIconRenderer iconName={iconName} cache={bootstrapIconsCache} onLoad={loadBootstrapIcon} />
                                </IconButton>
                              </div>
                            );
                          }}
                        />
                      )}
                    </Box>
                  </Tabs.Content>

                  <Tabs.Content value="custom">
                    <Flex direction="column" gap="3">
                      <Flex gap="2">
<TextField.Root
  placeholder={t('iconPicker.iconUrl')}
  value={newIconUrl}
                          onChange={(e) => setNewIconUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              if (newIconUrl.trim()) {
                                handleAddIconFromUrl();
                              }
                            }
                          }}
                          style={{ flex: 1 }}
                        />
                        <IconButton
                          variant="soft"
                          size="2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddIconFromUrl();
                          }}
                          disabled={!newIconUrl.trim()}
                          type="button"
                        >
                          <Link1Icon />
                        </IconButton>
                      </Flex>
                      
                      <Flex align="center" gap="2">
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          id="icon-file-input"
                        />
<Button
  variant="soft"
  size="2"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('icon-file-input')?.click();
  }}
  type="button"
>
  <UploadIcon /> {t('iconPicker.uploadFile')}
</Button>
                      </Flex>
                      
                      <ScrollArea style={{ height: "350px" }} scrollbars="vertical">
                        <Box p="2">
                          <Flex wrap="wrap" gap="2" justify="start" align="center">
                            {customIcons.length === 0 ? (
<Text size="2" color="gray" style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
  {t('iconPicker.noCustomIcons')}
</Text>
                            ) : customIcons.map((icon) => (
                              <Box key={icon.id} style={{ position: 'relative' }} className="icon-container">
                                <IconButton
                                  variant={iconId === icon.id && iconType === 'custom' ? "solid" : "soft"}
                                  color="gray"
                                  size="2"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleIconSelect('', 'custom', icon.id);
                                  }}
                                  type="button"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  {icon.type === 'svg' ? (
                                    <div dangerouslySetInnerHTML={{ __html: icon.data }} style={{ width: 18, height: 18 }} />
                                  ) : (
                                    <img src={icon.data} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                                  )}
                                </IconButton>
                                <IconButton
                                  variant="solid"
                                  color="red"
                                  size="1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteIcon(icon.id);
                                  }}
                                  className="icon-delete-btn"
                                  style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '16px',
                                    height: '16px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease'
                                  }}
                                >
                                  <TrashIcon style={{ width: '10px', height: '10px' }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Flex>
                        </Box>
                      </ScrollArea>
                    </Flex>
                  </Tabs.Content>
                </Tabs.Root>


              
              <style>
                {`
                  .icon-delete-btn {
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                  }
                  
                  .icon-container:hover .icon-delete-btn {
                    opacity: 1 !important;
                  }
                `}
              </style>
              </Box>
              </SettingsThemeProvider>
            }
          />

          {showReset && (
            <ActionIconButton
              variant="soft"
              size="1"
              onClick={handleReset}
              aria-label={t('common.resetIcon')}
            >
              <UpdateIcon />
            </ActionIconButton>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
