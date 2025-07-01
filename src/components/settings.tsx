import * as React from "react";
import { TextField, Flex, Text, Box, Switch, Slider, Separator, Tabs, Select, Theme } from "@radix-ui/themes";

import { SimpleTooltip } from "./SimpleTooltip";
import { GalleryImage } from "./GalleryImage";
import { Drawer } from "./Drawer";
import { Cross2Icon, ChevronDownIcon, ChevronUpIcon, GlobeIcon, PlusIcon, TrashIcon, PlayIcon, PauseIcon, UpdateIcon, ResetIcon, DownloadIcon, UploadIcon } from "@radix-ui/react-icons";
import { PrimaryButton, ActionIconButton } from "./ActionButtons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setLists } from "../store/listsSlice";
import { setFastLinks } from "../store/fastLinksSlice";
import {
  addImage,
  removeImage,
  setCurrentBackground,
  setFilter,
  resetFilters,
  setBackgroundType,
  setSolidBackground,
  setGradientBackground,
  setCustomGradientCSS,
  setParallaxEnabled,
  setShadowOverlayEnabled,
  setShadowOverlayIntensity,
  setShadowOverlayHeight,
  setAutoSwitchEnabled,
  setAutoSwitchMode,
  switchToRandomImage,
  resetToStandardBackground,
  setBorderlessBackground
} from "../store/backgroundSlice";
import {
  setClockColor,
  setClockEnabled,
  setClockShowSeconds,
  setClockShowDate,
  setClockSize,
  setRadixTheme,
  setRadixRadius,
  setListEnabled,
  setListBackgroundColor,
  setListBackdropBlur,
  setListTitleColor,
  setListLinkColor,
  setListHideBackground,
  setListSeparatorColor,
  setListSeparatorHidden,
  setListSeparatorThickness,
  setListBorderColor,
  setListBorderHidden,
  setListBorderThickness,
  setListHideIcons,
  setListGridColumns,
  setSearchVisible,
  setSearchBackgroundColor,
  setSearchBorderColor,
  setSearchTextColor,
  setSearchEngine,
  setSearchSize,
  setSearchBackdropBlur,
  setFontFamily,
  resetToDefaultTheme,
  setFastLinksEnabled,
  setFastLinksColumns,
  setFastLinksGlobalTextColor,
  setFastLinksGlobalBackdropColor,
  setFastLinksGlobalIconBackgroundColor,
  setFastLinksHideIcons,
  setFastLinksHideText,
  setFastLinksBackdropBlur,
  resetAllColorsToAccent,
  setCleanMode,
  setLanguage,
  resetAllSettings,
  resetToStandardSettings,
  setColors,
  setClockSettings,
  setListSettings,
  setSearchSettings,
  setFastLinksSettings
} from "../store/themeSlice";

import { resetAllCustomColors, toggleListEnabled, resetToStandardLists } from "../store/listsSlice";
import { resetAllFastLinkIndividualColors, resetToStandardFastLinks } from "../store/fastLinksSlice";
import { validateImageUrl } from "../utils/imageValidation";
import { createLinkColorFromAccent, createFastLinkColorFromAccent, isValidHexColor } from "../utils/colorUtils";
import { ColorPicker } from "./ColorPicker";
import { RadixThemePicker } from "./RadixThemePicker";
import { useTranslation, availableLanguages, LanguageCode, syncLanguageFromRedux, localizedAlert } from "../locales";
import { RadixRadiusPicker } from "./RadixRadiusPicker";
import { AutoColorButton } from "./AutoColorButton";
import { FontSelector } from "./FontSelector";
import { PresetManager } from "./PresetManager";
import { SEARCH_ENGINES } from "../data/searchEngines";
import { nanoid } from "nanoid";
import { SettingsThemeProvider } from "./ThemeProvider";

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddList?: () => void;
}

// Интерфейс для экспортируемых данных
interface ExportData {
  version: string;
  timestamp: number;
  localStorage: Record<string, string>;
}

// Функция для сбора всех данных из localStorage
const collectAllData = (): ExportData => {
  const data: ExportData = {
    version: '1.0.0',
    timestamp: Date.now(),
    localStorage: {}
  };

  try {
    // Собираем весь localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          data.localStorage[key] = value;
        }
      }
    }

    console.log('Collected data from localStorage:', Object.keys(data.localStorage).length, 'keys');
  } catch (error) {
    console.error('Error collecting data for export:', error);
  }

  return data;
};

// Функция экспорта настроек
const exportSettings = () => {
  try {
    const data = collectAllData();
    const jsonString = JSON.stringify(data, null, 2);

    // Создаем blob и скачиваем файл
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `listify-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log('Settings exported successfully');
  } catch (error) {
    console.error('Error exporting settings:', error);
    localizedAlert('errors.exportError');
  }
};

// Функция импорта настроек
const importSettings = (dispatch: any) => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data: ExportData = JSON.parse(text);

        // Проверяем версию и структуру данных
        if (!data.version || !data.timestamp || !data.localStorage) {
          throw new Error('Неверный формат файла настроек');
        }

        console.log('Importing data:', Object.keys(data.localStorage).length, 'keys');

        // Получаем текущие данные для добавления контента
        const currentLists = JSON.parse(localStorage.getItem('lists') || '[]');
        const currentFastLinks = JSON.parse(localStorage.getItem('fast-links') || '[]');
        const currentImages = JSON.parse(localStorage.getItem('background-images') || '[]');
        const currentPresets = JSON.parse(localStorage.getItem('theme-colors') || '{}').presets || [];

        // Функция для генерации нового ID
        const generateNewId = () => {
          return Date.now().toString(36) + Math.random().toString(36).substring(2);
        };

        // Создаем маппинг старых ID фонов на новые
        const backgroundIdMapping: Record<string, string> = {};

        // Импортируем фоновые изображения (добавляем к существующим)
        const importedImages = data.localStorage['background-images'];
        if (importedImages) {
          const newImages = JSON.parse(importedImages);
          if (Array.isArray(newImages)) {
            // Генерируем новые ID для импортируемых изображений и создаем маппинг
            const imagesWithNewIds = newImages.map((image: any) => {
              const newId = generateNewId();
              backgroundIdMapping[image.id] = newId; // Сохраняем маппинг старый ID -> новый ID
              return {
                ...image,
                id: newId
              };
            });

            // Объединяем изображения с новыми ID
            const mergedImages = [...currentImages, ...imagesWithNewIds];
            localStorage.setItem('background-images', JSON.stringify(mergedImages));
          }
        }

        // Применяем настройки темы (перезаписываем)
        const importedTheme = data.localStorage['theme-colors'];
        if (importedTheme) {
          const themeData = JSON.parse(importedTheme);

          // Сохраняем текущие пресеты для объединения
          const importedPresets = themeData.presets || [];

          // Генерируем новые ID для импортируемых пресетов и обновляем ID фонов
          const presetsWithNewIds = importedPresets.map((preset: any) => {
            const updatedPreset = {
              ...preset,
              id: generateNewId()
            };

            // Обновляем ID фона в пресете, если он ссылается на импортированное изображение
            if (preset.data?.background?.type === 'image' && preset.data.background.value) {
              const oldBackgroundId = preset.data.background.value;
              const newBackgroundId = backgroundIdMapping[oldBackgroundId];
              if (newBackgroundId) {
                updatedPreset.data.background.value = newBackgroundId;
                console.log(`Updated preset "${preset.name}" background ID: ${oldBackgroundId} -> ${newBackgroundId}`);
              }
            }

            return updatedPreset;
          });

          // Применяем тему без пресетов
          const themeWithoutPresets = { ...themeData };
          delete themeWithoutPresets.presets;

          // Объединяем пресеты с новыми ID
          themeWithoutPresets.presets = [...currentPresets, ...presetsWithNewIds];

          // Сохраняем объединенную тему
          localStorage.setItem('theme-colors', JSON.stringify(themeWithoutPresets));
        }

        // Применяем остальные настройки фона (перезаписываем)
        const backgroundKeys = [
          'background-filters',
          'background-type',
          'solid-background',
          'gradient-background',
          'parallax-enabled',
          'shadow-overlay',
          'auto-switch'
        ];

        backgroundKeys.forEach(key => {
          if (data.localStorage[key]) {
            localStorage.setItem(key, data.localStorage[key]);
          }
        });

        // Обрабатываем current-background отдельно, чтобы обновить ID если нужно
        const importedCurrentBackground = data.localStorage['current-background'];
        if (importedCurrentBackground) {
          // Проверяем, есть ли маппинг для этого ID фона
          const newBackgroundId = backgroundIdMapping[importedCurrentBackground];
          if (newBackgroundId) {
            // Используем новый ID
            localStorage.setItem('current-background', newBackgroundId);
            console.log(`Updated current background ID: ${importedCurrentBackground} -> ${newBackgroundId}`);
          } else {
            // Используем оригинальный ID (возможно, это не импортированное изображение)
            localStorage.setItem('current-background', importedCurrentBackground);
          }
        }

        // Импортируем списки (добавляем к существующим)
        const importedLists = data.localStorage['lists'];
        if (importedLists) {
          const newLists = JSON.parse(importedLists);
          if (Array.isArray(newLists) && newLists.length > 0) {
            // Генерируем новые ID для импортируемых списков и их ссылок
            const listsWithNewIds = newLists.map((list: any) => ({
              ...list,
              id: generateNewId(),
              links: list.links ? list.links.map((link: any) => ({
                ...link,
                id: generateNewId()
              })) : []
            }));

            // Объединяем списки с новыми ID
            const mergedLists = [...currentLists, ...listsWithNewIds];
            localStorage.setItem('lists', JSON.stringify(mergedLists));
          }
        }

        // Импортируем быстрые ссылки (добавляем к существующим)
        const importedFastLinks = data.localStorage['fast-links'];
        if (importedFastLinks) {
          const newFastLinks = JSON.parse(importedFastLinks);
          if (Array.isArray(newFastLinks) && newFastLinks.length > 0) {
            // Генерируем новые ID для импортируемых быстрых ссылок
            const fastLinksWithNewIds = newFastLinks.map((fastLink: any) => ({
              ...fastLink,
              id: generateNewId()
            }));

            // Объединяем быстрые ссылки с новыми ID
            const mergedFastLinks = [...currentFastLinks, ...fastLinksWithNewIds];
            localStorage.setItem('fast-links', JSON.stringify(mergedFastLinks));
          }
        }

        localizedAlert('errors.settingsImported');

        // Перезагружаем страницу для полного применения настроек
        window.location.reload();

      } catch (error) {
        console.error('Error parsing file:', error);
        localizedAlert('errors.invalidFileFormat');
      }
    };

    input.click();

  } catch (error) {
    console.error('Error importing settings:', error);
    localizedAlert('errors.importError');
  }
};

const Settings: React.FC<SettingsProps> = ({ open, onOpenChange, onAddList }) => {
  const [isFirefox, setIsFirefox] = React.useState(false);
  React.useEffect(() => {
    setIsFirefox(navigator.userAgent.toLowerCase().indexOf('firefox') > -1);
  }, []);

  const [presetDialogOpen, setPresetDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { images, currentBackground, filters, backgroundType, solidBackground, gradientBackground, parallaxEnabled, shadowOverlay, autoSwitch, borderlessBackground } = useAppSelector((state) => state.background);
  const { colors, clock, lists, search, font, fastLinks, radixTheme, radixRadius, cleanMode, language } = useAppSelector((state) => state.theme);

  const allLists = useAppSelector((state) => state.lists);

  // Синхронизируем язык из Redux при изменении
  React.useEffect(() => {
    syncLanguageFromRedux(language);
  }, [language]);

  // Хук для переводов (зависит от language для перерендера)
  const { t } = useTranslation();

  // Принудительный перерендер при изменении языка
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    forceUpdate();
  }, [language]);

  // Функция для глобального сброса всех цветов к акцентному
  const handleResetAllColorsToAccent = () => {
    // Сбрасываем все настройки цветов в themeSlice
    dispatch(resetAllColorsToAccent());
    // Сбрасываем индивидуальные цвета списков
    dispatch(resetAllCustomColors());
    // Сбрасываем индивидуальные цвета быстрых ссылок
    dispatch(resetAllFastLinkIndividualColors());
  };

  // Функция для полного сброса всех настроек к стандартным значениям
  const handleResetAllSettings = () => {
    if (confirm(t('errors.resetConfirm'))) {
      // Комплексный сброс с полной очисткой localStorage
      dispatch(resetToStandardSettings());

      // После очистки localStorage нужно также сбросить состояние других слайсов
      // Сбрасываем фон к стандартным настройкам
      dispatch(resetToStandardBackground());
      // Сбрасываем списки к стандартным (пустые)
      dispatch(resetToStandardLists());
      // Сбрасываем быстрые ссылки к стандартным (с README)
      dispatch(resetToStandardFastLinks());

      // Перезагружаем страницу для полного применения изменений
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
  const [imageUrl, setImageUrl] = React.useState("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [customGradientCSS, setCustomGradientCSSLocal] = React.useState(gradientBackground.customCSS || "");

const accardionStyle = {
              width: '100%',
              padding: '12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
    }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim() === "") return;

    setIsValidating(true);
    setError("");

    try {
      console.log("Validating image URL:", imageUrl.trim());
      const isValid = await validateImageUrl(imageUrl.trim());
      console.log("Validation result:", isValid);

      if (isValid) {
        const newImage = {
          id: nanoid(),
          url: imageUrl.trim(),
          addedAt: Date.now()
        };
        console.log("Adding image:", newImage);
        dispatch(addImage(newImage));
        
        // Проверяем включен ли borderless режим для Firefox
        if (borderlessBackground && isFirefox) {
          const { sendBackgroundToFirefox } = await import('../utils/firefoxBackground');
          const success = await sendBackgroundToFirefox(newImage.url, {
            blur: filters.blur,
            brightness: filters.brightness
          });
          
          if (!success) {
            console.warn('Failed to apply background to Firefox theme');
          }
        }
        
        setImageUrl("");
        console.log("Image added successfully");
      } else {
        setError(t('errors.invalidImageUrl'));
        console.log("Image validation failed");
      }
    } catch (err) {
      console.error("Error during validation:", err);
      setError(t('errors.imageValidationError'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    dispatch(removeImage(imageId));
  };



  const handleSetBackground = async (imageId: string) => {
    dispatch(setCurrentBackground(imageId));
    
    // Проверяем включен ли borderless режим для Firefox
    if (borderlessBackground && isFirefox) {
      const selectedImage = images.find(img => img.id === imageId);
      if (selectedImage) {
        const { sendBackgroundToFirefox } = await import('../utils/firefoxBackground');
        const success = await sendBackgroundToFirefox(selectedImage.url, {
          blur: filters.blur,
          brightness: filters.brightness
        });
        
        if (!success) {
          console.warn('Failed to apply background to Firefox theme');
        }
      }
    }
  };

  // Функция для быстрого добавления тестового изображения
  const handleAddTestImage = async () => {
    // Генерируем фиксированный seed для постоянного изображения
    const seed = Math.floor(Math.random() * 1000);
    const testImage = {
      id: nanoid(),
      url: `https://picsum.photos/seed/${seed}/1920/1080`,
      addedAt: Date.now()
    };
    console.log("Adding random image:", testImage);
    dispatch(addImage(testImage));
    
    // Проверяем включен ли borderless режим для Firefox
    if (borderlessBackground && isFirefox) {
      const { sendBackgroundToFirefox } = await import('../utils/firefoxBackground');
      const success = await sendBackgroundToFirefox(testImage.url, {
        blur: filters.blur,
        brightness: filters.brightness
      });
      
      if (!success) {
        console.warn('Failed to apply background to Firefox theme');
      }
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        side="left"
        width={420}
      >
      <SettingsThemeProvider>
        <Box p="4" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Flex justify="between" align="center" mb="4">
            <Text size="5" weight="bold">
              {t('settings.title')}
            </Text>
          <Flex gap="2">
            <SimpleTooltip content={t('tooltips.resetAllSettings')} side="bottom">
              <ActionIconButton
                variant="soft"
                color="gray"
                size="3"
                onClick={handleResetAllSettings}
                aria-label={t('ariaLabels.resetAllSettings')}
              >
                <ResetIcon />
              </ActionIconButton>
            </SimpleTooltip>
            <ActionIconButton
              variant="soft"
              color="gray"
              size="3"
              onClick={() => onOpenChange(false)}
              aria-label={t('ariaLabels.closeSettings')}
            >
              <Cross2Icon />
            </ActionIconButton>
          </Flex>
        </Flex>
          <Flex
            direction="column"
            gap="4"
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px"
            }}
            className="settings-scroll"
          >
     
         

            {/* Основные настройки */}
            <Box id="basic">
              <Text size="4" weight="bold" mb="3">
                {t('settings.basicSettings')}
              </Text>

              <Flex direction="column" gap="4">
                {/* Выбор языка */}
                <Box>
                  <Flex align="center" justify="between" mb="1">
                    <Text size="3" weight="medium">
                      {t('settings.language')}
                    </Text>
                    <Select.Root
                      value={language}
                      onValueChange={(value) => {
                        const newLanguage = value as LanguageCode;
                        dispatch(setLanguage(newLanguage));
                        // Синхронизация произойдет автоматически через useEffect
                      }}
                    >
                      <Select.Trigger style={{ minWidth: '120px' }} />
                      <Select.Content style={{ zIndex: 10000 }} color="gray">
                        {Object.entries(availableLanguages).map(([code, name]) => (
                          <Select.Item key={code} value={code}>
                            {name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                  <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                    {t('settings.aiTranslationsDisclaimer')}
                  </Text>
                </Box>

                {/* Кнопки экспорта и импорта */}
                <Flex align="center" justify="between">
                  <Text size="3" weight="medium">
                    {t('settings.exportSettings')}/{t('settings.importSettings')}
                  </Text>
                  <Flex gap="2">
                    <SimpleTooltip content={t('tooltips.exportSettings')}>
                      <ActionIconButton
                        variant="soft"
                        size="2"
                        onClick={exportSettings}
                        aria-label={t('tooltips.exportSettings')}
                      >
                        <DownloadIcon />
                      </ActionIconButton>
                    </SimpleTooltip>
                    <SimpleTooltip content={t('tooltips.importSettings')}>
                      <ActionIconButton
                        variant="soft"
                        size="2"
                        onClick={() => importSettings(dispatch)}
                        aria-label={t('tooltips.importSettings')}
                      >
                        <UploadIcon />
                      </ActionIconButton>
                    </SimpleTooltip>
                  </Flex>
                </Flex>
                {/* Цветовая схема */}
                <Box>
                  <Text size="3" weight="medium" mb="2">
                    {t('settings.colorScheme')}
                  </Text>
                  <Flex align="center" gap="2">
                    <Box style={{ flex: 1 }}>
                      <RadixThemePicker
                        label={t('settings.accentColor')}
                        value={radixTheme}
                        onChange={(theme) => {
                          dispatch(setRadixTheme(theme));
                        }}
                      />
                    </Box>
                    <SimpleTooltip content={t('tooltips.generateColor')}>
                      <AutoColorButton size="2" />
                    </SimpleTooltip>
                    <SimpleTooltip content={t('tooltips.applyAccentColor')}>
                      <ActionIconButton
                        variant="soft"
                        color="gray"
                        size="2"
                        type="button"
                        onClick={handleResetAllColorsToAccent}
                        aria-label={t('ariaLabels.applyAccentColor')}
                      >
                        <UpdateIcon />
                      </ActionIconButton>
                    </SimpleTooltip>
                  </Flex>
                </Box>

                {/* Скругление элементов */}
                <Box>
                  <Text size="3" weight="medium" mb="2">
                    {t('settings.borderRounding')}
                  </Text>
                  <RadixRadiusPicker
                    value={radixRadius}
                    onChange={(radius) => {
                      dispatch(setRadixRadius(radius));
                    }}
                  />
                </Box>

                {/* Чистый режим */}
                <Flex align="center" justify="between">
                  <Text size="3" weight="medium">
                    {t('settings.cleanMode')}
                  </Text>
                  <Switch
                    checked={cleanMode}
                    onCheckedChange={(checked) => dispatch(setCleanMode(checked))}
                  />
                </Flex>
              </Flex>
            </Box>

            <Separator size="4" />

            {/* Настройки часов */}
            <Box id="clock">
              <Text size="4" weight="bold" mb="3">
                {t('settings.clockSettings')}
              </Text>

              <Flex direction="column" gap="4">
                {/* Включение/отключение часов */}
                <Flex align="center" justify="between">
                  <Text size="2" weight="medium">
                    {t('settings.showClock')}
                  </Text>
                  <Switch
                    checked={clock.enabled}
                    onCheckedChange={(checked) => dispatch(setClockEnabled(checked))}
                  />
                </Flex>

                {clock.enabled && (
                  <>
                    {/* Показ секунд */}
                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.showSeconds')}
                      </Text>
                      <Switch
                        checked={clock.showSeconds}
                        onCheckedChange={(checked) => dispatch(setClockShowSeconds(checked))}
                      />
                    </Flex>

                    {/* Показ даты */}
                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.showDate')}
                      </Text>
                      <Switch
                        checked={clock.showDate}
                        onCheckedChange={(checked) => dispatch(setClockShowDate(checked))}
                      />
                    </Flex>

                    {/* Размер часов */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">
                          {t('settings.clockSize')}
                        </Text>
                        <Text size="2" color="gray">
                          {Math.round(clock.size * 100)}%
                        </Text>
                      </Flex>
                      <Slider
                        value={[clock.size]}
                        onValueChange={(value) => dispatch(setClockSize(value[0]))}
                        min={0.5}
                        max={2.5}
                        step={0.1}
                      />
                    </Box>

                    {/* Цвет часов */}
                    <ColorPicker
                      label={t('settings.clockColor')}
                      value={clock.color || (isValidHexColor(radixTheme) ? createLinkColorFromAccent(radixTheme) : radixTheme)}
                      onChange={(color) => dispatch(setClockColor(color))}
                      onReset={() => dispatch(setClockColor(''))}
                      showReset={!!clock.color}
                      disableAlpha={false}
                    />
                  </>
                )}
              </Flex>
            </Box>

            {/* Настройки поиска */}
            <Box id = "search">
              <Text size="4" weight="bold" mb="3">
                {t('settings.searchSettings')}
              </Text>

              <Flex direction="column" gap="3">
                {/* Видимость поисковика */}
                <Flex align="center" justify="between">
                  <Text size="2" weight="medium">
                    {t('settings.showSearch')}
                  </Text>
                  <Switch
                    checked={search.visible}
                    onCheckedChange={(checked) => dispatch(setSearchVisible(checked))}
                  />
                </Flex>

                {search.visible && (
                  <>
                    {/* Выбор поисковой системы */}
                    <Box>
                      <Text size="2" mb="2" weight="medium" as="div">
                        {t('settings.searchEngine')}
                      </Text>
                      
                        <Select.Root
                          value={search.searchEngine}
                          onValueChange={(value) => dispatch(setSearchEngine(value))}
                        >
                          <Select.Trigger style={{ width: '100%' }} />
                          <Select.Content style={{ zIndex: 10000 }} color="gray">
                            {SEARCH_ENGINES.map((engine) => (
                              <Select.Item key={engine.id} value={engine.id} >
                                {engine.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                    
                    </Box>

                    {/* Цветовые настройки */}
                    <ColorPicker
                      label={t('settings.searchBackgroundColor')}
                      value={search.backgroundColor || 'rgba(255, 255, 255, 0.1)'}
                      onChange={(color) => dispatch(setSearchBackgroundColor(color))}
                      onReset={() => dispatch(setSearchBackgroundColor(''))}
                      showReset={!!search.backgroundColor}
                      disableAlpha={false}
                    />

                    <ColorPicker
                      label={t('settings.searchBorderColor')}
                      value={search.borderColor || radixTheme}
                      onChange={(color) => dispatch(setSearchBorderColor(color))}
                      onReset={() => dispatch(setSearchBorderColor(''))}
                      showReset={!!search.borderColor}
                      disableAlpha={false}
                    />

                    <ColorPicker
                      label={t('settings.searchTextColor')}
                      value={search.textColor || radixTheme}
                      onChange={(color) => dispatch(setSearchTextColor(color))}
                      onReset={() => dispatch(setSearchTextColor(''))}
                      showReset={!!search.textColor}
                      disableAlpha={false}
                    />

                    {/* Размытие фона */}
                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.searchBackdropBlur')}
                      </Text>
                      <Switch
                        checked={search.backdropBlur}
                        onCheckedChange={(checked) => dispatch(setSearchBackdropBlur(checked))}
                      />
                    </Flex>

                    {/* Размер поисковика */}
                    <Box>
                      <Flex align="center" justify="between" mb="2">
                        <Text size="2" weight="medium">
                          {t('settings.searchSize')}
                        </Text>
                        <Text size="1" color="gray">
                          {Math.round(search.size * 100)}%
                        </Text>
                      </Flex>
                      <Slider
                        value={[search.size]}
                        onValueChange={([value]) => dispatch(setSearchSize(value))}
                        min={0.8}
                        max={1.5}
                        step={0.1}
                        style={{ width: '100%' }}
                      />
                    </Box>
                  </>
                )}
              </Flex>
            </Box>

             {/* Настройки быстрых ссылок */}
            <Box>
              <Text size="4" weight="bold" mb="3">
                {t('settings.fastLinksSettings')}
              </Text>

              <Flex direction="column" gap="4">
                {/* Включение/отключение быстрых ссылок */}
                <Flex align="center" justify="between">
                  <Text size="2" weight="medium">
                    {t('settings.showFastLinks')}
                  </Text>
                  <Switch
                    checked={fastLinks.enabled}
                    onCheckedChange={(checked) => dispatch(setFastLinksEnabled(checked))}
                  />
                </Flex>

                {fastLinks.enabled && (
                  <>
                    {/* Количество колонок */}
                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.fastLinksColumns')}
                      </Text>
                      <Flex align="center" gap="2" style={{ width: '120px' }}>
                        <Text size="1" color="gray" style={{ minWidth: '24px' }}>
                          {fastLinks.columns}
                        </Text>
                        <Slider
                          value={[fastLinks.columns]}
                          onValueChange={([value]) => dispatch(setFastLinksColumns(value))}
                          defaultValue={[5]}
                          min={2}
                          max={12}
                          step={1}
                          style={{ flex: 1 }}
                        />
                      </Flex>
                    </Flex>

                    {/* Глобальные цвета */}
                    <Box>
                      <Text size="3" weight="medium" mb="2" color="gray">
                        {t('settings.colors')}
                      </Text>
                      <Flex direction="column" gap="2">
                        <ColorPicker
                          label={t('settings.textColor')}
                          value={fastLinks.globalTextColor || (isValidHexColor(radixTheme) ? createFastLinkColorFromAccent(radixTheme) : '#FFFFFF')}
                          onChange={(color) => dispatch(setFastLinksGlobalTextColor(color))}
                          onReset={() => dispatch(setFastLinksGlobalTextColor(''))}
                          showReset={!!fastLinks.globalTextColor}
                          disableAlpha={false}
                        />

                        <ColorPicker
                          label={t('settings.backdropColor')}
                          value={fastLinks.globalBackdropColor || radixTheme}
                          onChange={(color) => dispatch(setFastLinksGlobalBackdropColor(color))}
                          onReset={() => dispatch(setFastLinksGlobalBackdropColor(''))}
                          showReset={!!fastLinks.globalBackdropColor}
                          disableAlpha={false}
                        />

                        <ColorPicker
                          label={t('settings.iconBackgroundColor')}
                          value={fastLinks.globalIconBackgroundColor || '#FFFFFF'}
                          onChange={(color) => dispatch(setFastLinksGlobalIconBackgroundColor(color))}
                          onReset={() => dispatch(setFastLinksGlobalIconBackgroundColor(''))}
                          showReset={!!fastLinks.globalIconBackgroundColor}
                          disableAlpha={false}
                        />
                      </Flex>
                    </Box>

                    {/* Настройки отображения */}
                    <Box>
                      <Text size="3" weight="medium" mb="2" as="div">
                        {t('settings.display')}
                      </Text>
                      <Flex direction="column" gap="3">
                        {/* Скрытие иконок */}
                        <Flex align="center" justify="between">
                          <Text size="2" weight="medium">
                            {t('settings.hideIcons')}
                          </Text>
                          <Switch
                            checked={fastLinks.hideIcons}
                            onCheckedChange={(checked) => dispatch(setFastLinksHideIcons(checked))}
                            disabled={fastLinks.hideText} // Блокируем если скрыт текст
                          />
                        </Flex>

                        {/* Скрытие текста */}
                        <Flex align="center" justify="between">
                          <Text size="2" weight="medium">
                            {t('settings.hideText')}
                          </Text>
                          <Switch
                            checked={fastLinks.hideText}
                            onCheckedChange={(checked) => dispatch(setFastLinksHideText(checked))}
                            disabled={fastLinks.hideIcons} // Блокируем если скрыты иконки
                          />
                        </Flex>
                      </Flex>
                    </Box>

                    {/* Эффекты фона */}
                    <Box>
                      <Text size="3" weight="medium" mb="2" as="div">
                        {t('settings.backgroundEffects')}
                      </Text>
                      <Flex direction="column" gap="3">
                        {/* Размытие фона */}
                        <Flex align="center" justify="between">
                          <Text size="2" weight="medium">
                            {t('settings.backgroundBlur')}
                          </Text>
                          <Switch
                            checked={fastLinks.backdropBlur > 0}
                            onCheckedChange={(checked) => dispatch(setFastLinksBackdropBlur(checked ? 10 : 0))}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </>
                )}
              </Flex>
            </Box>

            {/* Настройки списков */}
            <Box id = "lists">
              <Text size="4" weight="bold" mb="3">
                {t('settings.listsSettings')}
              </Text>

              <Flex direction="column" gap="4">
                {/* Включение/отключение списков */}
                <Flex align="center" justify="between">
                  <Text size="2" weight="medium">
                    {t('settings.showLists')}
                  </Text>
                  <Switch
                    checked={lists.enabled}
                    onCheckedChange={(checked) => dispatch(setListEnabled(checked))}
                  />
                </Flex>

                {lists.enabled && (
                  <>
                    {/* Кнопка добавления списка */}
                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.addNewList')}
                      </Text>
                      <ActionIconButton
                        variant="soft"
                        size="2"
                        onClick={() => onAddList?.()}
                        aria-label={t('settings.addNewList')}
                      >
                        <PlusIcon />
                      </ActionIconButton>
                    </Flex>

                    {/* Группа: Фон списков */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    {t('settings.listBackground')}
                  </Text>
                  <Flex direction="column" gap="2">
                    <ColorPicker
                      label={t('settings.backgroundColor')}
                      value={lists.backgroundColor}
                      onChange={(color) => dispatch(setListBackgroundColor(color))}
                      onReset={() => dispatch(setListBackgroundColor(''))}
                      showReset={!!lists.backgroundColor}
                      disableAlpha={false}
                    />

                    <ColorPicker
                      label={t('settings.borderColor')}
                      value={lists.borderColor || radixTheme}
                      onChange={(color) => dispatch(setListBorderColor(color))}
                      onReset={() => dispatch(setListBorderColor(''))}
                      showReset={!!lists.borderColor}
                      disableAlpha={false}
                      disabled={lists.borderHidden}
                    />

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium" style={{ opacity: lists.borderHidden ? 0.5 : 1 }}>
                        {t('settings.borderThickness')}
                      </Text>
                      <Flex align="center" gap="2" style={{ width: '120px' }}>
                        <Text size="1" color="gray" style={{ opacity: lists.borderHidden ? 0.5 : 1, minWidth: '24px' }}>
                          {lists.borderThickness}px
                        </Text>
                        <Slider
                          value={[lists.borderThickness]}
                          onValueChange={(value) => dispatch(setListBorderThickness(value[0]))}
                          min={1}
                          max={5}
                          step={1}
                          disabled={lists.borderHidden}
                          style={{
                            flex: 1,
                            opacity: lists.borderHidden ? 0.5 : 1
                          }}
                        />
                      </Flex>
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.hideBorder')}
                      </Text>
                      <Switch
                        checked={lists.borderHidden}
                        onCheckedChange={(checked) => dispatch(setListBorderHidden(checked))}
                      />
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.backgroundBlur')}
                      </Text>
                      <Switch
                        checked={lists.backdropBlur}
                        onCheckedChange={(checked) => dispatch(setListBackdropBlur(checked))}
                      />
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.hideBackground')}
                      </Text>
                      <Switch
                        checked={lists.hideBackground}
                        onCheckedChange={(checked) => dispatch(setListHideBackground(checked))}
                      />
                    </Flex>
                  </Flex>
                </Box>

                {/* Группа: Разделитель */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    {t('settings.separator')}
                  </Text>
                  <Flex direction="column" gap="2">
                    <ColorPicker
                      label={t('settings.separatorColor')}
                      value={lists.separatorColor || radixTheme}
                      onChange={(color) => dispatch(setListSeparatorColor(color))}
                      onReset={() => dispatch(setListSeparatorColor(''))}
                      showReset={!!lists.separatorColor}
                      disableAlpha={false}
                      disabled={lists.separatorHidden}
                    />

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium" style={{ opacity: lists.separatorHidden ? 0.5 : 1 }}>
                        {t('settings.separatorThickness')}
                      </Text>
                      <Flex align="center" gap="2" style={{ width: '120px' }}>
                        <Text size="1" color="gray" style={{ opacity: lists.separatorHidden ? 0.5 : 1, minWidth: '24px' }}>
                          {lists.separatorThickness}px
                        </Text>
                        <Slider
                          value={[lists.separatorThickness]}
                          onValueChange={(value) => dispatch(setListSeparatorThickness(value[0]))}
                          min={1}
                          max={10}
                          step={1}
                          disabled={lists.separatorHidden}
                          style={{
                            flex: 1,
                            opacity: lists.separatorHidden ? 0.5 : 1
                          }}
                        />
                      </Flex>
                    </Flex>

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.hideSeparator')}
                      </Text>
                      <Switch
                        checked={lists.separatorHidden}
                        onCheckedChange={(checked) => dispatch(setListSeparatorHidden(checked))}
                      />
                    </Flex>
                  </Flex>
                </Box>

                {/* Группа: Содержимое */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    {t('settings.colorsAndIcons')}
                  </Text>
                  <Flex direction="column" gap="2">
                    <ColorPicker
                      label={t('settings.titleColor')}
                      value={lists.titleColor || radixTheme}
                      onChange={(color) => dispatch(setListTitleColor(color))}
                      onReset={() => dispatch(setListTitleColor(''))}
                      showReset={!!lists.titleColor}
                      disableAlpha={false}
                    />

                    <ColorPicker
                      label={t('lists.linkColor')}
                      value={lists.linkColor || (isValidHexColor(radixTheme) ? createLinkColorFromAccent(radixTheme) : `color-mix(in srgb, ${radixTheme} 70%, var(--gray-12) 30%)`)}
                      onChange={(color) => dispatch(setListLinkColor(color))}
                      onReset={() => dispatch(setListLinkColor(''))}
                      showReset={!!lists.linkColor}
                      disableAlpha={false}
                    />

                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.hideLinkIcons')}
                      </Text>
                      <Switch
                        checked={lists.hideIcons}
                        onCheckedChange={(checked) => dispatch(setListHideIcons(checked))}
                      />
                    </Flex>


                  </Flex>
                </Box>

                {/* Группа: Сетка списков */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    {t('settings.listGrid')}
                  </Text>
                  <Flex direction="column" gap="2">
                    <Flex align="center" justify="between">
                      <Text size="2" weight="medium">
                        {t('settings.columnsCount')}
                      </Text>
                      <Flex align="center" gap="2" style={{ width: '120px' }}>
                        <Text size="1" color="gray" style={{ minWidth: '24px' }}>
                          {lists.gridColumns}
                        </Text>
                        <Slider
                          value={[lists.gridColumns]}
                          onValueChange={(value) => dispatch(setListGridColumns(value[0]))}
                          min={2}
                          max={10}
                          step={1}
                          defaultValue={[4]}
                          style={{ flex: 1 }}
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>

                {/* Группа: Управление списками */}
                <Box>
                  <Text size="3" weight="medium" mb="2" color="gray">
                    {t('settings.listManagement')}
                  </Text>
                  <Flex direction="column" gap="2">
                    {/* Список всех списков с переключателями */}
                    {allLists.map((list) => (
                      <Flex key={list.id} align="center" justify="between">
                        <Text size="2" weight="medium" style={{ opacity: list.enabled === false ? 0.5 : 1 }}>
                          {list.title}
                        </Text>
                        <Switch
                          checked={list.enabled !== false}
                          onCheckedChange={() => dispatch(toggleListEnabled(list.id))}
                        />
                      </Flex>
                    ))}
                  </Flex>
                </Box>
                  </>
                )}
              </Flex>
            </Box>

            <Separator size="4" />
            <Box>
              <Text size="4" weight="bold" mb="2">
                {t('settings.backgroundSettings')}
              </Text>

              <Tabs.Root value={backgroundType} onValueChange={(value) => dispatch(setBackgroundType(value as any))}>
                <Tabs.List>
                  <Tabs.Trigger value="image">{t('settings.image')}</Tabs.Trigger>
                  <Tabs.Trigger value="solid">{t('settings.solidColor')}</Tabs.Trigger>
                  <Tabs.Trigger value="gradient">{t('settings.gradient')}</Tabs.Trigger>
                </Tabs.List>

                {/* Вкладка изображений */}
                <Tabs.Content value="image">

                  <Box mt="3">
                    <Flex direction="column" gap="3" style={{ padding: "0 8px" }}>
                    <form onSubmit={handleSubmit} style={{  display: "flex", flexDirection: "column", overflow: "hidden" }} >
                      <Box>
                       
                        <Text size="2" mb="2" weight="medium" as="div">
                          {t('settings.addImage')}
                        </Text>
                        <TextField.Root
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          required
                          type="url"
                          style={{margin: "15px 1px"}}
                        />
                        {error && (
                          <Text size="1" color="red" mt="1" as="div">
                            {error}
                          </Text>
                        )}
                       
                      </Box>

                      <Flex gap="2" align="center">
                        <PrimaryButton
                          
                          type="submit"
                          disabled={isValidating}
                        >
                          {isValidating ? t('settings.checking') : t('settings.addImage')}
                        </PrimaryButton>

                        {/* Кнопка добавления случайного фото */}
                        <SimpleTooltip content={t('settings.addRandomPhoto')}>
                          <ActionIconButton
                            variant="soft"
                            size="2"
                            onClick={(e) => {
                              e?.preventDefault();
                              e?.stopPropagation();
                              handleAddTestImage();
                            }}
                            aria-label={t('settings.addRandomPhoto')}
                          >
                            <GlobeIcon />
                          </ActionIconButton>
                        </SimpleTooltip>
                      </Flex>
                         </form>
                      {/* Переключатель безграничного фона для Firefox */}
                      {isFirefox && (
                        <Box>
                          <Flex align="center" gap="2">
                            <Switch
                              checked={borderlessBackground}
                              onCheckedChange={async (checked) => {
                                dispatch(setBorderlessBackground(checked));
                                
                                if (checked) {
                                  // Включаем режим - применяем текущий фон
                                  if (currentBackground) {
                                    const selectedImage = images.find(img => img.id === currentBackground);
                                    if (selectedImage) {
                                      const { sendBackgroundToFirefox } = await import('../utils/firefoxBackground');
                                      await sendBackgroundToFirefox(selectedImage.url, {
                                        blur: filters.blur,
                                        brightness: filters.brightness
                                      });
                                    }
                                  }
                                } else {
                                  // Отключаем режим - сбрасываем тему
                                  const { resetFirefoxTheme } = await import('../utils/firefoxBackground');
                                  await resetFirefoxTheme();
                                }
                              }}
                            />
                            <Text size="2" weight="medium">
                              {t('settings.borderlessBackground')}
                            </Text>
                          </Flex>
                          <Text size="1" color="gray" mt="1">
                            {t('settings.borderlessBackgroundDescription')}
                          </Text>
                        </Box>
                      )}

                      {/* Переключатель параллакса */}
                      <Box>
                        <Flex align="center" gap="2">
                          <Switch
                            checked={parallaxEnabled}
                            onCheckedChange={(checked) => dispatch(setParallaxEnabled(checked))}
                          />
                          <Text size="2" weight="medium">
                            {t('settings.parallaxEffect')}
                          </Text>
                        </Flex>
                        <Text size="1" color="gray" mt="1">
                          {t('settings.parallaxDescription')}
                        </Text>
                      </Box>
                      
                      {/* Настройки затенения */}
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <Switch
                            checked={shadowOverlay.enabled}
                            onCheckedChange={(checked) => dispatch(setShadowOverlayEnabled(checked))}
                          />
                          <Text size="2" weight="medium">
                            {t('settings.shadowBottom')}
                          </Text>
                        </Flex>
                        <Text size="1" color="gray" mb="3">
                          {t('settings.shadowDescription')}
                        </Text>

                        {shadowOverlay.enabled && (
                          <Box>
                            <Flex align="center" gap="2" mb="2">
                              <Text size="1" color="gray" style={{ minWidth: '100px' }}>
                                {t('settings.intensity')}
                              </Text>
                              <Slider
                                value={[shadowOverlay.intensity]}
                                onValueChange={(value) => dispatch(setShadowOverlayIntensity(value[0]))}
                                max={200}
                                min={0}
                                step={5}
                                style={{ flex: 1, width: '120px' }}
                              />
                              <Text size="1" color="gray" style={{ minWidth: '40px' }}>
                                {shadowOverlay.intensity}%
                              </Text>
                            </Flex>

                            <Flex align="center" gap="2" mb="2">
                              <Text size="1" color="gray" style={{ minWidth: '100px' }}>
                                {t('settings.height')}
                              </Text>
                              <Slider
                                value={[shadowOverlay.height]}
                                onValueChange={(value) => dispatch(setShadowOverlayHeight(value[0]))}
                                max={100}
                                min={20}
                                step={5}
                                style={{ flex: 1, width: '120px' }}
                              />
                              <Text size="1" color="gray" style={{ minWidth: '40px' }}>
                                {shadowOverlay.height}%
                              </Text>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    </Flex>
                      
              {/* Мини-галерея */}
              {images.length > 0 && (
                <Box mt="4">
                  <Flex align="center" justify="between" mb="3">
                    <Text size="3" weight="medium">
                      {t('settings.gallery')} ({images.length})
                    </Text>

                    {/* Автоматическое переключение */}
                    <Flex align="center" gap="2">
                      <SimpleTooltip content={autoSwitch.enabled ? t('settings.stopAutoSwitch') : t('settings.startAutoSwitch')}>
                        <ActionIconButton
                          onClick={() => dispatch(setAutoSwitchEnabled(!autoSwitch.enabled))}
                          variant="soft"
                          color="blue"
                          size="1"
                          type="button"
                        >
                          {autoSwitch.enabled ? <PauseIcon /> : <PlayIcon />}
                        </ActionIconButton>
                      </SimpleTooltip>

                      <Select.Root
                        value={autoSwitch.mode}
                        onValueChange={(value) => dispatch(setAutoSwitchMode(value as any))}
                        size="1"
                      >
                        <Select.Trigger style={{ minWidth: "120px" }} />
                        <Select.Content style={{ zIndex: 10000 }}>
                          <Select.Item value="onLoad">{t('settings.onLoad')}</Select.Item>
                          <Select.Item value="daily">{t('settings.daily')}</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Flex>
                  </Flex>
                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "4px",
                      maxHeight: "280px",
                      overflowY: "auto"
                    }}
                  >
                    {images.map((image, index) => (
                      <Box
                        key={image.id}
                        style={{
                          position: "relative"
                        }}
                      >
                        <GalleryImage
                          src={image.url}
                          alt="Background"
                          isSelected={currentBackground === image.id}
                          onClick={() => handleSetBackground(image.id)}
                          index={index}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            opacity: 0,
                            transition: "opacity 0.2s",
                            zIndex: 10
                          }}
                          className="delete-btn"
                        >
                          <ActionIconButton
                            variant="solid"
                            color="red"
                            size="1"
                            onClick={(e) => {
                              e?.stopPropagation();
                              handleRemoveImage(image.id);
                            }}
                            aria-label={t('settings.deleteImage')}
                          >
                            <TrashIcon />
                          </ActionIconButton>
                        </div>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
                  </Box>
                </Tabs.Content>

                {/* Вкладка цвета */}
                <Tabs.Content value="solid">
                  <Box mt="3" style={{ padding: "0 8px" }}>
                    <ColorPicker
                      label={t('settings.backgroundColor')}
                      value={solidBackground.color}
                      onChange={(color) => dispatch(setSolidBackground({ color }))}
                      onReset={() => dispatch(setSolidBackground({ color: '' }))}
                      showReset={!!solidBackground.color}
                      disableAlpha={false}
                    />
                  </Box>
                </Tabs.Content>

                {/* Вкладка градиента */}
                <Tabs.Content value="gradient">
                  <Box mt="3" style={{ padding: "0 8px" }}>
                    <Flex direction="column" gap="3">
                      <Box>
                        <Text size="2" mb="2" weight="medium" as="div">{t('settings.gradientType')}</Text>
                        <Tabs.Root
                          value={gradientBackground.type}
                          onValueChange={(value) =>
                            dispatch(setGradientBackground({
                              ...gradientBackground,
                              type: value as 'linear' | 'radial'
                            }))
                          }
                        >
                          <Tabs.List>
                            <Tabs.Trigger value="linear">{t('settings.linear')}</Tabs.Trigger>
                            <Tabs.Trigger value="radial">{t('settings.radial')}</Tabs.Trigger>
                          </Tabs.List>
                        </Tabs.Root>
                      </Box>

                      {/* Цвета градиента */}
                      <Box>
                        <Flex align="center" justify="between" mb="2">
                          <Text size="2" weight="medium">{t('settings.colors')}</Text>
                          <SimpleTooltip content={t('settings.addColor')}>
                            <ActionIconButton
                              variant="soft"
                              size="1"
                              onClick={() => {
                                const newColors = [...gradientBackground.colors, '#ffffff'];
                                dispatch(setGradientBackground({
                                  ...gradientBackground,
                                  colors: newColors
                                }));
                              }}
                              aria-label={t('settings.addColor')}
                            >
                              <PlusIcon />
                            </ActionIconButton>
                          </SimpleTooltip>
                        </Flex>

                        {gradientBackground.colors.map((color, index) => (
                          <Flex key={index} align="center" gap="2" mb="2">
                            <ColorPicker
                              label={`${t('settings.color')} ${index + 1}`}
                              value={color}
                              onChange={(newColor) => {
                                const newColors = [...gradientBackground.colors];
                                newColors[index] = newColor;
                                dispatch(setGradientBackground({
                                  ...gradientBackground,
                                  colors: newColors
                                }));
                              }}
                              onReset={() => {
                                const newColors = [...gradientBackground.colors];
                                newColors[index] = '';
                                dispatch(setGradientBackground({
                                  ...gradientBackground,
                                  colors: newColors
                                }));
                              }}
                              showReset={!!color}
                              disableAlpha={false}
                            />
                            {gradientBackground.colors.length > 2 && (
                              <SimpleTooltip content={t('settings.deleteColor')}>
                                <ActionIconButton
                                  variant="soft"
                                  size="1"
                                  onClick={() => {
                                    const newColors = gradientBackground.colors.filter((_, i) => i !== index);
                                    dispatch(setGradientBackground({
                                      ...gradientBackground,
                                      colors: newColors
                                    }));
                                  }}
                                  aria-label={t('settings.deleteColor')}
                                >
                                  <TrashIcon />
                                </ActionIconButton>
                              </SimpleTooltip>
                            )}
                          </Flex>
                        ))}
                      </Box>

                      {gradientBackground.type === 'linear' && (
                        <Box>
                          <Text size="2" mb="2" weight="medium" as="div">{t('settings.direction')}</Text>
                          <Select.Root
                            value={gradientBackground.direction || 'to right'}
                            onValueChange={(value) =>
                              dispatch(setGradientBackground({
                                ...gradientBackground,
                                direction: value
                              }))
                            }
                          >
                            <Select.Trigger />
                            <Select.Content style={{ zIndex: 2147483647 }}>
                              <Select.Item value="to right">{t('settings.right')}</Select.Item>
                              <Select.Item value="to left">{t('settings.left')}</Select.Item>
                              <Select.Item value="to bottom">{t('settings.bottom')}</Select.Item>
                              <Select.Item value="to top">{t('settings.top')}</Select.Item>
                              <Select.Item value="to bottom right">{t('settings.bottomRight')}</Select.Item>
                              <Select.Item value="to bottom left">{t('settings.bottomLeft')}</Select.Item>
                              <Select.Item value="to top right">{t('settings.topRight')}</Select.Item>
                              <Select.Item value="to top left">{t('settings.topLeft')}</Select.Item>
                              <Select.Item value="45deg">45°</Select.Item>
                              <Select.Item value="90deg">90°</Select.Item>
                              <Select.Item value="135deg">135°</Select.Item>
                              <Select.Item value="180deg">180°</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Box>
                      )}

                      {gradientBackground.type === 'radial' && (
                        <Box>
                          <Text size="2" mb="2" weight="medium" as="div">{t('settings.position')}</Text>
                          <Select.Root
                            value={gradientBackground.position || 'center'}
                            onValueChange={(value) =>
                              dispatch(setGradientBackground({
                                ...gradientBackground,
                                position: value
                              }))
                            }
                          >
                            <Select.Trigger />
                            <Select.Content style={{ zIndex: 2147483647 }}>
                              <Select.Item value="center">{t('settings.center')}</Select.Item>
                              <Select.Item value="top">{t('settings.top')}</Select.Item>
                              <Select.Item value="bottom">{t('settings.bottom')}</Select.Item>
                              <Select.Item value="left">{t('settings.left')}</Select.Item>
                              <Select.Item value="right">{t('settings.right')}</Select.Item>
                              <Select.Item value="top left">{t('settings.topLeft')}</Select.Item>
                              <Select.Item value="top right">{t('settings.topRight')}</Select.Item>
                              <Select.Item value="bottom left">{t('settings.bottomLeft')}</Select.Item>
                              <Select.Item value="bottom right">{t('settings.bottomRight')}</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Box>
                      )}

                      {/* Поле для кастомного CSS градиента */}
                      <Box>
                        <Text size="2" mb="2" weight="medium" as="div">
                          {t('settings.customCSS')}
                        </Text>
                        <TextField.Root
                          value={customGradientCSS}
                          onChange={(e) => {
                            setCustomGradientCSSLocal(e.target.value);
                            dispatch(setCustomGradientCSS(e.target.value));
                          }}
                          placeholder="linear-gradient(45deg, #ff0000, #0000ff)"
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            width: "100%"
                          }}
                        />
                        <Text size="1" color="gray" mt="1" as="div">
                          {t('settings.customCSSDescription')}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                </Tabs.Content>
              </Tabs.Root>

              {/* Фильтры фона */}
              <Box mt="4" id="filters-section">
                <Flex
                  align="center"
                  justify="between"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setFiltersExpanded(!filtersExpanded);
                    // Автоматическая прокрутка к фильтрам при раскрытии
                    if (!filtersExpanded) {
                      setTimeout(() => {
                        document.getElementById('filters-section')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    }
                  }}
                >
                  <Text size="3" weight="medium">
                    {t('settings.backgroundFilters')}
                  </Text>
                  <Flex align="center" gap="1">
                    <ActionIconButton
                      variant="soft"
                      color="gray"
                      size="1"
                      onClick={(e) => {
                        e?.stopPropagation();
                        dispatch(resetFilters());
                      }}
                      aria-label={t('settings.resetFilters')}
                    >
                      <UpdateIcon />
                    </ActionIconButton>
                    <ActionIconButton
                      variant="ghost"
                      size="1"
                      onClick={(e) => {
                        e?.stopPropagation();
                        setFiltersExpanded(!filtersExpanded);
                        // Автоматическая прокрутка к фильтрам при раскрытии
                        if (!filtersExpanded) {
                          setTimeout(() => {
                            document.getElementById('filters-section')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }, 100);
                        }
                      }}
                      aria-label={filtersExpanded ? t('settings.collapseFilters') : t('settings.expandFilters')}
                    >
                      {filtersExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </ActionIconButton>
                  </Flex>
                </Flex>

                {filtersExpanded && (
                  <Box mt="3" style={{
                    animation: "slideDown 0.2s ease-out",
                    overflow: "hidden",
                    padding: "8px"
                  }}>
                    <Flex direction="column" gap="3">
                      {/* Размытие */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.blur')}: {filters.blur}px</Text>
                        <Slider
                          value={[filters.blur]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'blur', value }))}
                          max={20}
                          step={1}
                        />
                      </Box>

                      {/* Яркость */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.brightness')}: {filters.brightness}%</Text>
                        <Slider
                          value={[filters.brightness]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'brightness', value }))}
                          min={0}
                          max={200}
                          step={5}
                        />
                      </Box>

                      {/* Контрастность */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.contrast')}: {filters.contrast}%</Text>
                        <Slider
                          value={[filters.contrast]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'contrast', value }))}
                          min={0}
                          max={200}
                          step={5}
                        />
                      </Box>

                      {/* Насыщенность */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.saturation')}: {filters.saturate}%</Text>
                        <Slider
                          value={[filters.saturate]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'saturate', value }))}
                          min={0}
                          max={200}
                          step={5}
                        />
                      </Box>

                      {/* Поворот оттенка */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.hueRotate')}: {filters.hueRotate}°</Text>
                        <Slider
                          value={[filters.hueRotate]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'hueRotate', value }))}
                          min={0}
                          max={360}
                          step={5}
                        />
                      </Box>

                      {/* Сепия */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.sepia')}: {filters.sepia}%</Text>
                        <Slider
                          value={[filters.sepia]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'sepia', value }))}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </Box>

                      {/* Черно-белое */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.grayscale')}: {filters.grayscale}%</Text>
                        <Slider
                          value={[filters.grayscale]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'grayscale', value }))}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </Box>

                      {/* Инверсия */}
                      <Box>
                        <Text size="2" mb="1" as="div">{t('settings.invert')}: {filters.invert}%</Text>
                        <Slider
                          value={[filters.invert]}
                          onValueChange={([value]) => dispatch(setFilter({ key: 'invert', value }))}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </Box>




                  </Flex>
                </Box>
              )}
              </Box>
            
             
            </Box>
              {/* Настройки шрифтов */}
            <Box id = "font-settings">
              <Text size="4" weight="bold" mb="3">
                {t('settings.font')}
              </Text>

              <Flex direction="column" gap="3">
                <FontSelector
                  value={font.fontFamily}
                  onValueChange={(fontId) => dispatch(setFontFamily(fontId))}
                />
              </Flex>
            </Box>
            
                 {/* Пресеты */}
            <Box id = "presets">
              <PresetManager onDialogOpenChange={setPresetDialogOpen} />
            </Box>
          </Flex>

        </Box>
      </SettingsThemeProvider>
    </Drawer>

    {/* CSS для управления z-index настроек */}
    <style>
      {`
        /* Уменьшаем z-index настроек когда открыт диалог пресета */
        ${presetDialogOpen ? `
          [data-radix-drawer-content] {
            z-index: 5000 !important;
          }
          [data-radix-drawer-overlay] {
            z-index: 4999 !important;
          }
        ` : ''}
      `}
    </style>
  </>
  );
};

export default Settings;

// Добавляем стили для скроллбара и исправления Select
const scrollStyle = document.createElement('style');
scrollStyle.textContent = `


  /* Исправляем проблему с масштабированием Select в настройках */
  .settings-scroll [data-radix-select-trigger],
  .settings-scroll [data-radix-select-trigger] *,
  [data-radix-select-content],
  [data-radix-select-content] *,
  [data-radix-select-viewport],
  [data-radix-select-viewport] *,
  [data-radix-select-item],
  [data-radix-select-item] * {
    transform: none !important;
    scale: 1 !important;
  }

  /* Портал для Select должен игнорировать родительские transform */
  [data-radix-popper-content-wrapper] {
    transform: none !important;
    scale: 1 !important;
  }

  /* Высокий z-index для Select и Tooltip в диалоге */
  [data-radix-select-content],
  [data-radix-tooltip-content],
  [data-radix-popper-content] {
    z-index: 2147483647 !important;
    transform: none !important;
    scale: 1 !important;
    position: fixed !important;
  }

  /* Специально для Tooltip */
  [data-radix-tooltip-content] {
    z-index: 2147483648 !important;
    position: fixed !important;
    pointer-events: none !important;
  }

  /* Tooltip портал */
  [data-radix-tooltip-portal] {
    z-index: 2147483648 !important;
  }

  /* Анимация для аккордеона */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Анимация для элементов галереи */
  @keyframes slideInGallery {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Hover эффекты для галереи */
  .gallery-item:hover img {
    transform: scale(1.1) !important;
  }

  .gallery-item:active img {
    transform: scale(1.05) !important;
  }

  /* Анимация для кнопки автоподбора цветов */
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

if (!document.head.querySelector('style[data-settings-scroll]')) {
  scrollStyle.setAttribute('data-settings-scroll', 'true');
  document.head.appendChild(scrollStyle);
}

// Добавляем стили для hover эффекта
const hoverStyle = document.createElement('style');
hoverStyle.textContent = `
  .delete-btn {
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
  }

  .delete-btn:hover,
  .delete-btn:focus {
    opacity: 1 !important;
  }

  [style*="position: relative"]:hover .delete-btn {
    opacity: 1 !important;
  }
`;

if (!document.head.querySelector('style[data-settings-hover]')) {
  hoverStyle.setAttribute('data-settings-hover', 'true');
  document.head.appendChild(hoverStyle);
}

// Стили для Accordion
const accordionStyle = document.createElement('style');
accordionStyle.textContent = `
  [data-radix-accordion-trigger] {
    all: unset;
    font-family: inherit;
    background-color: transparent;
    padding: 0 20px;
    height: 45px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    line-height: 1;
    color: var(--gray-12);
    box-shadow: 0 1px 0 var(--gray-6);
    background-color: white;
    cursor: pointer;
  }
  [data-radix-accordion-trigger]:hover {
    background-color: var(--gray-2);
  }
  [data-radix-accordion-trigger]:focus {
    position: relative;
    box-shadow: 0 0 0 2px var(--accent-8);
  }
  [data-radix-accordion-trigger][data-state="closed"] > .ChevronIcon {
    transform: rotate(0deg);
  }
  [data-radix-accordion-trigger][data-state="open"] > .ChevronIcon {
    transform: rotate(180deg);
  }
  .ChevronIcon {
    color: var(--accent-10);
    transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  [data-radix-accordion-content] {
    overflow: hidden;
    font-size: 14px;
    color: var(--gray-11);
    background-color: var(--gray-2);
  }
  [data-radix-accordion-content][data-state="open"] {
    animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  [data-radix-accordion-content][data-state="closed"] {
    animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  @keyframes slideDown {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }
  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
`;

if (!document.head.querySelector('style[data-accordion-styles]')) {
  accordionStyle.setAttribute('data-accordion-styles', 'true');
  document.head.appendChild(accordionStyle);
}
