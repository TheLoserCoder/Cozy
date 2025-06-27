import * as React from "react";
import { Box, Text, Button, TextField, Flex, IconButton, Dialog } from "@radix-ui/themes";
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon, Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { createPortal } from "react-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { createPreset, applyPreset, deletePreset, renamePreset, updatePreset } from "../store/themeSlice";
import { applyPresetBackground } from "../store/backgroundSlice";
import { setListColor, setListIcon, setListIconColor, setLinkColor, resetAllCustomStyles, applyListStates } from "../store/listsSlice";
import { PresetPreview } from "./PresetPreview";

interface PresetManagerProps {
  onDialogOpenChange?: (open: boolean) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({ onDialogOpenChange }) => {
  const dispatch = useAppDispatch();
  const { presets } = useAppSelector((state) => state.theme);
  const [newPresetName, setNewPresetName] = React.useState("");
  const [editingPresetId, setEditingPresetId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Получаем данные о текущем фоне из других частей store
  const {
    currentBackground, backgroundType, solidBackground, gradientBackground, filters,
    images, parallaxEnabled, shadowOverlay, autoSwitch
  } = useAppSelector((state) => state.background);

  // Получаем данные о списках и ссылках для индивидуальных стилей
  const allLists = useAppSelector((state) => state.lists);

  const getCurrentBackgroundData = () => {
    const baseData = {
      images: [...images],
      parallaxEnabled,
      shadowOverlay: shadowOverlay ? { ...shadowOverlay } : undefined,
      autoSwitch: autoSwitch ? { ...autoSwitch } : undefined,
      filters: { ...filters }
    };

    switch (backgroundType) {
      case 'image':
        return {
          type: 'image' as const,
          value: currentBackground || '',
          ...baseData
        };
      case 'solid':
        return {
          type: 'solid' as const,
          value: solidBackground.color,
          ...baseData
        };
      case 'gradient':
        // Создаем CSS градиент из настроек
        const { type, colors, direction, customCSS } = gradientBackground;
        const gradientValue = customCSS || (type === 'linear'
          ? `linear-gradient(${direction || 'to right'}, ${colors.join(', ')})`
          : `radial-gradient(${colors.join(', ')})`);
        return {
          type: 'gradient' as const,
          value: gradientValue,
          ...baseData
        };
      default:
        return {
          type: 'solid' as const,
          value: '#000000',
          ...baseData
        };
    }
  };

  // Функция для сбора индивидуальных стилей
  const getIndividualStyles = () => {
    const listStyles: { [key: string]: any } = {};
    const linkStyles: { [key: string]: any } = {};

    // Собираем стили всех списков (включая отсутствие стилей)
    allLists.forEach(list => {
      listStyles[list.id] = {
        customColor: list.customColor || undefined,
        iconColor: list.iconColor || undefined,
        icon: list.icon || undefined, // Важно: сохраняем undefined если иконки нет
        customSeparatorColor: list.customSeparatorColor || undefined,
        customLinkColor: list.customLinkColor || undefined
      };

      // Собираем индивидуальные стили ссылок
      list.links.forEach(link => {
        if (link.customColor) {
          linkStyles[link.id] = {
            customColor: link.customColor
          };
        }
      });
    });

    return {
      lists: Object.keys(listStyles).length > 0 ? listStyles : undefined,
      links: Object.keys(linkStyles).length > 0 ? linkStyles : undefined
    };
  };

  // Функция для получения текущего состояния активации списков
  const getListStates = () => {
    const listStates: { [listId: string]: boolean } = {};
    allLists.forEach(list => {
      listStates[list.id] = list.enabled !== false; // По умолчанию true, если не указано иное
    });
    return listStates;
  };

  const handleCreatePreset = () => {
    if (newPresetName.trim()) {
      const backgroundData = getCurrentBackgroundData();
      const individualStyles = getIndividualStyles();
      const listStates = getListStates();

      dispatch(createPreset({
        name: newPresetName.trim(),
        backgroundData,
        individualStyles,
        listStates
      }));
      setNewPresetName("");
      setCreateDialogOpen(false);
    }
  };

  const handleUpdatePreset = (presetId: string, event?: React.MouseEvent) => {
    // Предотвращаем всплытие события
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const backgroundData = getCurrentBackgroundData();
    const individualStyles = getIndividualStyles();
    const listStates = getListStates();

    dispatch(updatePreset({
      id: presetId,
      backgroundData,
      individualStyles,
      listStates
    }));
  };

  const handleApplyPreset = (presetId: string, event?: React.MouseEvent) => {
    // Предотвращаем всплытие события и отправку формы
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      // Сначала сбрасываем все индивидуальные стили (включая иконки)
      dispatch(resetAllCustomStyles());

      // Применяем настройки темы
      dispatch(applyPreset(presetId));

      // Применяем фон из пресета
      dispatch(applyPresetBackground(preset.data.background));

      // Применяем индивидуальные стили из пресета
      if (preset.data.individualStyles) {
        const { lists: listStyles, links: linkStyles } = preset.data.individualStyles;

        // Применяем стили списков
        if (listStyles) {
          Object.entries(listStyles).forEach(([listId, styles]: [string, any]) => {
            // Применяем цвет заголовка (может быть undefined для сброса)
            dispatch(setListColor({ id: listId, color: styles.customColor }));

            // Применяем цвет иконки (может быть undefined для сброса)
            dispatch(setListIconColor({ id: listId, color: styles.iconColor }));

            // Применяем иконку (может быть undefined для сброса)
            dispatch(setListIcon({ id: listId, icon: styles.icon }));

            // TODO: Добавить применение других стилей списков (customSeparatorColor, customLinkColor)
          });
        }

        // Применяем стили ссылок
        if (linkStyles) {
          Object.entries(linkStyles).forEach(([linkId, styles]: [string, any]) => {
            if (styles.customColor) {
              // Нужно найти listId для этой ссылки
              const listWithLink = allLists.find(list =>
                list.links.some(link => link.id === linkId)
              );
              if (listWithLink) {
                dispatch(setLinkColor({
                  listId: listWithLink.id,
                  linkId,
                  color: styles.customColor
                }));
              }
            }
          });
        }
      }

      // Применяем состояние активации списков из пресета
      if (preset.data.listStates) {
        dispatch(applyListStates(preset.data.listStates));
      }
    }
  };

  const handleDeletePreset = (presetId: string) => {
    dispatch(deletePreset(presetId));
  };

  const handleStartEdit = (presetId: string, currentName: string) => {
    setEditingPresetId(presetId);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingPresetId && editingName.trim()) {
      dispatch(renamePreset({ 
        id: editingPresetId, 
        name: editingName.trim() 
      }));
    }
    setEditingPresetId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingPresetId(null);
    setEditingName("");
  };

  return (
    <Box>
      <Flex align="center" justify="between" mb="3">
        <Text size="4" weight="bold">
          Пресеты
        </Text>
        <Dialog.Root
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            onDialogOpenChange?.(open);
          }}
        >
          <Dialog.Trigger>
            <Button size="2" variant="soft" type="button">
              <PlusIcon width="16" height="16" />
              Создать пресет
            </Button>
          </Dialog.Trigger>
          {createPortal(
            <Dialog.Content style={{ maxWidth: 400, zIndex: 15001 }}>
              <Dialog.Title>Создать новый пресет</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                Пресет сохранит текущие настройки цветов, шрифтов и фона.
              </Dialog.Description>

              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" mb="1" weight="medium" as="div">
                    Название пресета
                  </Text>
                  <TextField.Root
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Введите название..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreatePreset();
                      }
                    }}
                  />
                </Box>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray" type="button">
                      Отмена
                    </Button>
                  </Dialog.Close>
                  <Button
                    onClick={handleCreatePreset}
                    disabled={!newPresetName.trim()}
                    type="button"
                  >
                    Создать
                  </Button>
                </Flex>
              </Flex>
            </Dialog.Content>,
            document.body
          )}
        </Dialog.Root>
      </Flex>

      {presets.length === 0 ? (
        <Box
          style={{
            padding: '24px',
            textAlign: 'center',
            border: '1px dashed var(--gray-6)',
            borderRadius: 'var(--radius-3)',
            color: 'var(--gray-9)'
          }}
        >
          <Text size="2">
            Пресеты не созданы. Создайте первый пресет для быстрого переключения между настройками.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="2">
          {presets.map((preset) => (
            <Flex
              key={preset.id}
              align="center"
              gap="3"
              p="3"
              style={{
                border: '1px solid var(--gray-6)',
                borderRadius: 'var(--radius-3)',
                backgroundColor: 'var(--color-surface)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-6)';
              }}
            >
              {/* Превью пресета */}
              <PresetPreview preset={preset} size="small" />
              
              {/* Название пресета */}
              <Box style={{ flex: 1 }}>
                {editingPresetId === preset.id ? (
                  <Flex align="center" gap="2">
                    <TextField.Root
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      size="2"
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <IconButton
                      size="1"
                      variant="soft"
                      color="green"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveEdit();
                      }}
                      type="button"
                    >
                      <CheckIcon width="12" height="12" />
                    </IconButton>
                    <IconButton
                      size="1"
                      variant="soft"
                      color="gray"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      type="button"
                    >
                      <Cross2Icon width="12" height="12" />
                    </IconButton>
                  </Flex>
                ) : (
                  <Flex direction="column">
                    <Text size="3" weight="medium">
                      {preset.name}
                    </Text>
                    <Text size="1" color="gray">
                      {new Date(preset.createdAt).toLocaleDateString('ru-RU')}
                    </Text>
                  </Flex>
                )}
              </Box>
              
              {/* Кнопки действий */}
              {editingPresetId !== preset.id && (
                <Flex gap="1">
                  <Button
                    size="2"
                    variant="soft"
                    onClick={(e) => handleApplyPreset(preset.id, e)}
                    type="button"
                  >
                    Применить
                  </Button>
                  <IconButton
                    size="2"
                    variant="soft"
                    color="gray"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStartEdit(preset.id, preset.name);
                    }}
                    type="button"
                    title="Переименовать пресет"
                  >
                    <Pencil2Icon width="14" height="14" />
                  </IconButton>
                  <IconButton
                    size="2"
                    variant="soft"
                    color="blue"
                    onClick={(e) => handleUpdatePreset(preset.id, e)}
                    type="button"
                    title="Обновить пресет текущими настройками"
                  >
                    <UpdateIcon width="14" height="14" />
                  </IconButton>
                  <IconButton
                    size="2"
                    variant="soft"
                    color="red"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeletePreset(preset.id);
                    }}
                    type="button"
                    title="Удалить пресет"
                  >
                    <TrashIcon width="14" height="14" />
                  </IconButton>
                </Flex>
              )}
            </Flex>
          ))}
        </Flex>
      )}

      {/* CSS для принудительного повышения z-index диалога */}
      <style>
        {`
          /* Повышаем z-index для диалога создания пресета выше Drawer */
          [data-radix-dialog-overlay] {
            z-index: 15000 !important;
          }
          [data-radix-dialog-content] {
            z-index: 15001 !important;
          }

          /* Альтернативные селекторы для разных версий Radix */
          .rt-DialogOverlay {
            z-index: 15000 !important;
          }
          .rt-DialogContent {
            z-index: 15001 !important;
          }

          /* Убеждаемся что диалог поверх всех Drawer */
          [data-radix-drawer-overlay] {
            z-index: 10000 !important;
          }
          [data-radix-drawer-content] {
            z-index: 10001 !important;
          }
        `}
      </style>
    </Box>
  );
};
