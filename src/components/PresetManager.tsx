import * as React from "react";
import { Box, Text, Button, TextField, Flex, IconButton, Dialog } from "@radix-ui/themes";
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon, Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { createPortal } from "react-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { createPreset, applyPreset, deletePreset, renamePreset, updatePreset, resetToStandardSettings } from "../store/themeSlice";
import { applyPresetBackground, setBorderlessBackground } from "../store/backgroundSlice";
import { setListColor, setListIcon, setListIconColor, setListSeparatorColor, setListLinkColor, setLinkColor, editLink, resetAllCustomStyles, applyListStates } from "../store/listsSlice";
import { resetAllFastLinkIndividualColors, applyFastLinkStyles } from "../store/fastLinksSlice";
import { PresetPreview } from "./PresetPreview";
import { useTranslation } from "../locales";

interface PresetManagerProps {
  onDialogOpenChange?: (open: boolean) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({ onDialogOpenChange }) => {
  const dispatch = useAppDispatch();
  const { presets, activePresetId } = useAppSelector((state) => state.theme);
  const [newPresetName, setNewPresetName] = React.useState("");
  const [editingPresetId, setEditingPresetId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const { t } = useTranslation();

  // Получаем данные о текущем фоне из других частей store
  const {
    currentBackground, backgroundType, solidBackground, gradientBackground, filters,
    shadowOverlay, autoSwitch
  } = useAppSelector((state) => state.background);

  // Получаем данные о списках и ссылках для индивидуальных стилей
  const allLists = useAppSelector((state) => state.lists);
  const fastLinks = useAppSelector((state) => state.fastLinks);

  const getCurrentBackgroundData = () => {
    const baseData = {
      // Не сохраняем галерею изображений и эффект параллакса в пресетах
      // images: [...images],
      // parallaxEnabled,
      shadowOverlay: shadowOverlay ? { ...shadowOverlay } : undefined,
      autoSwitch: autoSwitch ? { ...autoSwitch } : undefined,
      filters: { ...filters },
      borderlessBackground: localStorage.getItem('borderless-background') === 'true'
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
    const fastLinkStyles: { [key: string]: any } = {};

    // Собираем стили списков (только если есть кастомные настройки)
    allLists.forEach(list => {
      const hasCustomStyles = list.customColor || list.iconColor || list.icon || list.iconId || list.iconType || list.customSeparatorColor || list.customLinkColor;
      if (hasCustomStyles) {
        listStyles[list.id] = {
          customColor: list.customColor || undefined,
          iconColor: list.iconColor || undefined,
          icon: list.icon || undefined,
          iconId: list.iconId || undefined,
          iconType: list.iconType || undefined,
          customSeparatorColor: list.customSeparatorColor || undefined,
          customLinkColor: list.customLinkColor || undefined
        };
      }

      // Собираем индивидуальные стили ссылок
      list.links.forEach(link => {
        const hasCustomStyles = link.customColor || link.iconId || link.iconType || link.iconColor;
        if (hasCustomStyles) {
          linkStyles[link.id] = {
            customColor: link.customColor || undefined,
            iconId: link.iconId || undefined,
            iconType: link.iconType || undefined,
            iconColor: link.iconColor || undefined
          };
        }
      });
    });

    // Собираем индивидуальные стили быстрых ссылок (только если есть кастомные настройки)
    fastLinks.forEach(fastLink => {
      const hasCustomStyles = fastLink.customTextColor || fastLink.customBackdropColor || 
                             fastLink.customIconBackgroundColor || fastLink.iconId || 
                             fastLink.iconType || fastLink.iconColor;
      if (hasCustomStyles) {
        fastLinkStyles[fastLink.id] = {
          customTextColor: fastLink.customTextColor || undefined,
          customBackdropColor: fastLink.customBackdropColor || undefined,
          customIconBackgroundColor: fastLink.customIconBackgroundColor || undefined,
          iconId: fastLink.iconId || undefined,
          iconType: fastLink.iconType || undefined,
          iconColor: fastLink.iconColor || undefined
        };
      }
    });

    return {
      lists: Object.keys(listStyles).length > 0 ? listStyles : undefined,
      links: Object.keys(linkStyles).length > 0 ? linkStyles : undefined,
      fastLinks: Object.keys(fastLinkStyles).length > 0 ? fastLinkStyles : undefined
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
      dispatch(resetAllFastLinkIndividualColors());

      // Применяем настройки темы (это переписывает ВСЕ настройки темы)
      dispatch(applyPreset(presetId));

      // Применяем фон из пресета (это переписывает ВСЕ настройки фона)
      dispatch(applyPresetBackground(preset.data.background));
      
      // Применяем borderless background из пресета
      if (preset.data.background.borderlessBackground !== undefined) {
        dispatch(setBorderlessBackground(preset.data.background.borderlessBackground));
      }

      // Применяем индивидуальные стили из пресета
      if (preset.data.individualStyles) {
        const { lists: listStyles, links: linkStyles, fastLinks: fastLinkStyles } = preset.data.individualStyles;

        // Применяем стили списков
        if (listStyles) {
          Object.entries(listStyles).forEach(([listId, styles]: [string, any]) => {
            // Применяем цвет заголовка (может быть undefined для сброса)
            dispatch(setListColor({ id: listId, color: styles.customColor }));

            // Применяем цвет иконки (может быть undefined для сброса)
            dispatch(setListIconColor({ id: listId, color: styles.iconColor }));

            // Применяем иконку (может быть undefined для сброса)
            dispatch(setListIcon({ 
              id: listId, 
              icon: styles.icon,
              iconId: styles.iconId,
              iconType: styles.iconType
            }));

            // Применяем цвет разделителя и ссылок списка
            if (styles.customSeparatorColor !== undefined) {
              dispatch(setListSeparatorColor({ id: listId, color: styles.customSeparatorColor }));
            }
            if (styles.customLinkColor !== undefined) {
              dispatch(setListLinkColor({ id: listId, color: styles.customLinkColor }));
            }

            // TODO: Добавить применение других стилей списков (customSeparatorColor, customLinkColor)
          });
        }

        // Применяем стили ссылок
        if (linkStyles) {
          Object.entries(linkStyles).forEach(([linkId, styles]: [string, any]) => {
            // Нужно найти listId для этой ссылки
            const listWithLink = allLists.find(list =>
              list.links.some(link => link.id === linkId)
            );
            if (listWithLink) {
              // Применяем все стили ссылки
              dispatch(editLink({
                listId: listWithLink.id,
                linkId,
                updates: {
                  customColor: styles.customColor,
                  iconId: styles.iconId,
                  iconType: styles.iconType,
                  iconColor: styles.iconColor
                }
              }));
            }
          });
        }

        // Применяем стили быстрых ссылок
        if (fastLinkStyles) {
          dispatch(applyFastLinkStyles(fastLinkStyles));
        }
      }

      // Применяем состояние активации списков из пресета
      if (preset.data.listStates) {
        dispatch(applyListStates(preset.data.listStates));
      }
    }
  };

  const handleDeletePreset = (presetId: string) => {
    // Если удаляем активный пресет, нужно обработать переключение
    if (activePresetId === presetId) {
      const remainingPresets = presets.filter(p => p.id !== presetId);

      if (remainingPresets.length > 0) {
        // Есть другие пресеты - сначала переключаемся на первый
        const nextPreset = remainingPresets[0];
        handleApplyPreset(nextPreset.id);

        // Затем удаляем старый пресет
        dispatch(deletePreset(presetId));
      } else {
        // Пресетов не осталось - сначала применяем дефолтные настройки
        dispatch(resetToStandardSettings());

        // Затем удаляем пресет
        dispatch(deletePreset(presetId));
      }
    } else {
      // Удаляем неактивный пресет - просто удаляем
      dispatch(deletePreset(presetId));
    }
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
          {t('settings.presets')}
        </Text>
        <Dialog.Root
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            onDialogOpenChange?.(open);
          }}
        >
          <Dialog.Trigger>
            <Button color = "gray" size="2" variant="soft" type="button">
              <PlusIcon width="16" height="16" />
              {t('settings.createPreset')}
            </Button>
          </Dialog.Trigger>
          {createPortal(
            <Dialog.Content style={{ maxWidth: 400, zIndex: 15001 }}>
              <Dialog.Title>{t('settings.createNewPreset')}</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                {t('settings.presetDescription')}
              </Dialog.Description>

              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" mb="1" weight="medium" as="div">
                    {t('settings.presetName')}
                  </Text>
                  <TextField.Root
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder={t('common.enterName')}
                    color="gray"
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
                      {t('common.cancel')}
                    </Button>
                  </Dialog.Close>
                  <Button
                    onClick={handleCreatePreset}
                    disabled={!newPresetName.trim()}
                    type="button"
                    color="gray"
                  >
                    {t('common.create')}
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
            {t('settings.noPresets')}
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="2">
          {presets.slice().reverse().map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <Flex
                key={preset.id}
                align="center"
                gap="3"
                p="3"
                style={{
                  border: isActive ? '2px solid var(--accent-9)' : '1px solid var(--gray-6)',
                  borderRadius: 'var(--radius-3)',
                  backgroundColor: isActive ? 'var(--accent-2)' : 'var(--color-surface)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--gray-8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--gray-6)';
                  }
                }}
                onClick={(e) => {
                  // Проверяем, что клик не был по кнопкам действий
                  const target = e.target as HTMLElement;
                  const isButton = target.closest('button') || target.closest('[role="button"]');
                  if (!isButton && editingPresetId !== preset.id) {
                    handleApplyPreset(preset.id, e);
                  }
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
                    <Text
                      size="3"
                      weight="medium"
                      style={{
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={preset.name}
                    >
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
                    title={t('settings.renamePreset')}
                  >
                    <Pencil2Icon width="14" height="14" />
                  </IconButton>
                  <IconButton
                    size="2"
                    variant="soft"
                    color="blue"
                    onClick={(e) => handleUpdatePreset(preset.id, e)}
                    type="button"
                    title={t('settings.updatePreset')}
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
                    title={t('settings.deletePreset')}
                  >
                    <TrashIcon width="14" height="14" />
                  </IconButton>
                </Flex>
              )}
            </Flex>
            );
          })}
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
