import * as React from "react";
import { Box, Flex, Text, Button, IconButton, ScrollArea, TextField } from "@radix-ui/themes";
import { PlusIcon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { ThemedDialog } from "./ThemedDialog";
import { ActionIconButton, PrimaryButton, CancelButton } from "./ActionButtons";
import { SettingsThemeProvider } from "./ThemeProvider";
import { nanoid } from "nanoid";

interface IconPack {
  id: string;
  name: string;
  icons: Array<{
    id: string;
    name: string;
    type: 'svg' | 'image';
    data: string;
  }>;
  addedAt: number;
}

interface IconPackManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IconPackManager: React.FC<IconPackManagerProps> = ({
  open,
  onOpenChange
}) => {
  const [iconPacks, setIconPacks] = React.useState<IconPack[]>([]);
  const [editingPack, setEditingPack] = React.useState<IconPack | null>(null);
  const [packName, setPackName] = React.useState('');

  // Загружаем паки при открытии
  React.useEffect(() => {
    if (open) {
      loadIconPacks();
    }
  }, [open]);

  const loadIconPacks = () => {
    const port = chrome?.runtime?.connect({ name: 'icon-manager' });
    if (port) {
      port.postMessage({ type: 'EXPORT_ALL_DATA' });
      port.onMessage.addListener((response) => {
        if (response.success && response.iconPacks) {
          setIconPacks(response.iconPacks);
        }
        port.disconnect();
      });
    }
  };

  const handleAddPack = async (files: FileList) => {
    if (!files || files.length === 0 || !packName.trim()) return;
    
    const packId = nanoid();
    
    // Обрабатываем все файлы параллельно
    const filePromises = Array.from(files).map(file => {
      return new Promise<any>((resolve) => {
        const iconId = nanoid();
        const reader = new FileReader();
        
        reader.onload = (e) => {
          resolve({
            id: iconId,
            name: file.name,
            type: file.type.includes('svg') ? 'svg' : 'image',
            data: e.target?.result as string
          });
        };
        
        if (file.type.includes('svg')) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    });
    
    const icons = await Promise.all(filePromises);
    
    const iconPack = {
      id: packId,
      name: packName.trim(),
      icons: icons,
      addedAt: Date.now()
    };
    
    const port = chrome?.runtime?.connect({ name: 'icon-manager' });
    if (port) {
      port.postMessage({
        type: 'SAVE_ICON_PACK',
        pack: iconPack
      });
      
      port.onMessage.addListener((response) => {
        if (response.success) {
          setPackName('');
          loadIconPacks();
        }
        port.disconnect();
      });
    }
  };

  const handleDeletePack = (packId: string) => {
    if (confirm('Удалить пак иконок?')) {
      const port = chrome?.runtime?.connect({ name: 'icon-manager' });
      if (port) {
        port.postMessage({
          type: 'DELETE_ICON_PACK',
          packId: packId
        });
        
        port.onMessage.addListener((response) => {
          if (response.success) {
            setIconPacks(prev => prev.filter(pack => pack.id !== packId));
          }
          port.disconnect();
        });
      }
    }
  };

  const handleDeleteIcon = (packId: string, iconId: string) => {
    setIconPacks(prev => prev.map(pack => 
      pack.id === packId 
        ? { ...pack, icons: pack.icons.filter(icon => icon.id !== iconId) }
        : pack
    ));
  };

  const handleRenamePack = (pack: IconPack) => {
    setEditingPack(pack);
  };

  const handleSavePackName = () => {
    if (editingPack && packName.trim()) {
      setIconPacks(prev => prev.map(pack => 
        pack.id === editingPack.id 
          ? { ...pack, name: packName.trim() }
          : pack
      ));
      setEditingPack(null);
      setPackName('');
    }
  };

  return (
    <ThemedDialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Управление паками иконок"
      title={<Text as="div" size="5" weight="bold" mb="2">Управление паками иконок</Text>}
    >
      <Box
        position="fixed"
        left="50%"
        top="50%"
        p="4"
        style={{
          borderRadius: 24,
          transform: "translate(-50%, -50%)",
          background: "#fff",
          boxShadow: "0 10px 40px 0 rgba(0,0,0,0.25)",
          width: '600px',
          maxHeight: '80vh',
          zIndex: 1010,
        }}
      >
        <SettingsThemeProvider>
        <Flex direction="column" gap="4" p="4">
          {/* Добавление нового пака */}
          <Box>
            <Text size="3" weight="medium" mb="2">Добавить новый пак</Text>
            <Flex gap="2" mb="2">
              <TextField.Root
                placeholder="Название пака"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="file"
                multiple
                accept="image/*,.svg"
                style={{ display: 'none' }}
                id="icon-pack-files"
                onChange={(e) => {
                  if (e.target.files) {
                    handleAddPack(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                variant="soft"
                size="2"
                onClick={() => document.getElementById('icon-pack-files')?.click()}
                disabled={!packName.trim()}
              >
                <PlusIcon /> Добавить файлы
              </Button>
            </Flex>
          </Box>

          {/* Список паков */}
          <ScrollArea style={{ height: '450px', overflowX: 'hidden' }}>
            <Flex direction="column" gap="3" style={{ width: '100%' }}>
              {iconPacks.length === 0 ? (
                <Text size="2" color="gray" style={{ textAlign: 'center', padding: '20px' }}>
                  Нет установленных паков иконок
                </Text>
              ) : iconPacks.map((pack) => (
                <Box key={pack.id} style={{ border: '1px solid var(--gray-6)', borderRadius: '8px', padding: '12px', width: '100%' }}>
                  <Flex align="center" justify="between" mb="2">
                    {editingPack?.id === pack.id ? (
                      <Flex gap="2" align="center" style={{ flex: 1 }}>
                        <TextField.Root
                          value={packName}
                          onChange={(e) => setPackName(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <ActionIconButton
                          variant="soft"
                          size="1"
                          onClick={handleSavePackName}
                        >
                          ✓
                        </ActionIconButton>
                        <ActionIconButton
                          variant="soft"
                          size="1"
                          onClick={() => {
                            setEditingPack(null);
                            setPackName('');
                          }}
                        >
                          ✕
                        </ActionIconButton>
                      </Flex>
                    ) : (
                      <>
                        <Text size="2" weight="medium">{pack.name} ({pack.icons.length})</Text>
                        <Flex gap="1">
                          <ActionIconButton
                            variant="soft"
                            size="1"
                            onClick={() => {
                              setEditingPack(pack);
                              setPackName(pack.name);
                            }}
                          >
                            <Pencil1Icon />
                          </ActionIconButton>
                          <ActionIconButton
                            variant="soft"
                            size="1"
                            color="red"
                            onClick={() => handleDeletePack(pack.id)}
                          >
                            <TrashIcon />
                          </ActionIconButton>
                        </Flex>
                      </>
                    )}
                  </Flex>
                  
                  <Box style={{ width: '100%', }}>
                    <Flex wrap="wrap" gap="2" style={{ width: '100%' }}>
                      {pack.icons.map((icon) => (
                        <Box 
                          key={icon.id} 
                          style={{ position: 'relative', flexShrink: 0 }}
                          className="icon-container"
                        >
                          <Box
                            style={{
                              width: '36px',
                              height: '36px',
                              border: '1px solid var(--gray-6)',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'var(--gray-1)'
                            }}
                          >
                            {icon.type === 'svg' ? (
                              <div dangerouslySetInnerHTML={{ __html: icon.data }} style={{ width: 18, height: 18 }} />
                            ) : (
                              <img src={icon.data} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                            )}
                          </Box>
                          <ActionIconButton
                            variant="solid"
                            color="red"
                            size="1"
                            onClick={() => handleDeleteIcon(pack.id, icon.id)}
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
                          </ActionIconButton>
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Flex>
          </ScrollArea>

          <Flex justify="end" gap="2">
            <CancelButton onClick={() => onOpenChange(false)}>
              Закрыть
            </CancelButton>
          </Flex>
        </Flex>
        </SettingsThemeProvider>
      </Box>
      
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
    </ThemedDialog>
  );
};