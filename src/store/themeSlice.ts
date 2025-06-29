import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LanguageCode } from '../locales';

export interface ThemeColors {
  accent: string;
  links: string;
  clock: string;
}

export interface ClockSettings {
  enabled: boolean;
  showSeconds: boolean;
  showDate: boolean;
  size: number; // от 0.5 до 2.5
  color: string;
}

export interface ListSettings {
  enabled: boolean; // Включены ли списки вообще
  backgroundColor: string;
  backdropBlur: boolean;
  titleColor: string; // Цвет заголовков списков (переопределяет акцентный)
  linkColor: string; // Цвет ссылок в списках (переопределяет общий)
  hideBackground: boolean; // Полное скрытие фона списков
  separatorColor: string; // Цвет разделителя между заголовком и ссылками
  separatorHidden: boolean; // Скрытие разделителя
  separatorThickness: number; // Толщина разделителя (1-10)
  borderColor: string; // Цвет границы фона списка
  borderHidden: boolean; // Скрытие границы
  borderThickness: number; // Толщина границы (1-5)
  hideIcons: boolean; // Скрытие иконок ссылок
  gridColumns: number; // Количество колонок в сетке (2-10, по умолчанию 4)
}

export interface SearchSettings {
  visible: boolean; // Видимость поисковика
  backgroundColor: string; // Цвет фона поисковика
  borderColor: string; // Цвет границы поисковика
  textColor: string; // Цвет текста поисковика
  searchEngine: string; // Выбранная поисковая система
  size: number; // Размер поисковика (0.8 - 1.5)
  backdropBlur: boolean; // Размытие фона поисковика
}

export interface FontSettings {
  fontFamily: string; // ID выбранного шрифта
}

export interface FastLinkSettings {
  enabled: boolean; // Включены ли быстрые ссылки
  columns: number; // Количество колонок (2-12, по умолчанию 5)
  globalTextColor?: string; // Глобальный цвет текста заголовков
  globalBackdropColor?: string; // Глобальный цвет задника (внешний круг)
  globalIconBackgroundColor?: string; // Глобальный цвет фона иконки (внутренний круг)
  hideIcons: boolean; // Скрывать иконки
  hideText: boolean; // Скрывать текст
  backdropBlur: number; // Размытие фона (0-20)
}

export interface PresetData {
  colors: ThemeColors;
  clock: ClockSettings;
  lists: ListSettings;
  search: SearchSettings;
  font: FontSettings;
  fastLinks: FastLinkSettings;
  radixTheme: string;
  radixRadius: string; // Тип скругления элементов
  background: {
    type: 'image' | 'solid' | 'gradient';
    value: string; // URL изображения, цвет или градиент
    filters?: any; // Фильтры изображения если есть
    images?: any[]; // Все изображения
    parallaxEnabled?: boolean;
    shadowOverlay?: any;
    autoSwitch?: any;
  };
  // Индивидуальные настройки списков и ссылок
  individualStyles?: {
    lists?: { [listId: string]: any }; // Индивидуальные стили списков
    links?: { [linkId: string]: any }; // Индивидуальные стили ссылок
    fastLinks?: { [fastLinkId: string]: any }; // Индивидуальные стили быстрых ссылок
  };
  // Состояние активации списков
  listStates?: { [listId: string]: boolean }; // Какие списки включены/выключены
}

export interface Preset {
  id: string;
  name: string;
  data: PresetData;
  createdAt: number;
}

interface ThemeState {
  colors: ThemeColors;
  clock: ClockSettings;
  lists: ListSettings;
  search: SearchSettings;
  font: FontSettings;
  fastLinks: FastLinkSettings;
  radixTheme: string; // Кастомный цвет для Radix темы
  radixRadius: string; // Радиус скругления для Radix темы
  presets: Preset[]; // Сохраненные пресеты
  activePresetId: string | null; // ID активного пресета
  cleanMode: boolean; // Чистый режим - скрывает кнопки редактирования
  language: LanguageCode; // Выбранный язык интерфейса
}

// Функции для работы с localStorage
const STORAGE_KEY = 'theme-colors';

// Все ключи localStorage используемые в приложении
const ALL_STORAGE_KEYS = [
  'theme-colors', // Настройки темы
  'fast-links', // Быстрые ссылки
  'lists', // Списки ссылок
  'background-images', // Фоновые изображения
  'current-background', // Текущий фон
  'background-filters', // Фильтры фона
  'background-type', // Тип фона
  'solid-background', // Сплошной фон
  'gradient-background', // Градиентный фон
  'parallax-enabled', // Параллакс
  'shadow-overlay', // Теневое наложение
  'auto-switch', // Автопереключение фона
];

// Функция для полной очистки localStorage
export function clearAllLocalStorage(): void {
  try {
    ALL_STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('localStorage полностью очищен');
  } catch (error) {
    console.error('Ошибка при очистке localStorage:', error);
  }
}

// Стандартные настройки согласно требованиям
const STANDARD_THEME_COLOR = '#000000'; // Черный акцент
const STANDARD_CLOCK_COLOR = '#000000'; // Черный
const STANDARD_LIST_BACKGROUND_COLOR = '#FFFFFF'; // Белый фон для списков

// Объект стандартных настроек для кнопки сброса
export const standardSettings = {
  colors: {
    accent: '#000000', // Черный акцент
    links: '#000000', // Черные ссылки
    clock: '#000000', // Черные часы
  } as ThemeColors,

  clock: {
    enabled: true, // Показывать часы - включено
    showSeconds: false, // Показывать секунды - выключено
    showDate: false, // Показывать дату - выключено
    size: 1.0, // Размер часов - 100%
    color: '#000000', // Цвет - черный
  } as ClockSettings,

  search: {
    visible: true, // Показывать поисковик - да
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Цвет фона - полупрозрачный белый
    borderColor: '#000000', // Цвет границ - черный (акцентный)
    textColor: '#000000', // Цвет текста - черный (акцентный)
    searchEngine: 'google', // Поисковая система - гугл
    size: 1.0, // Размер поисковика 100%
    backdropBlur: false, // Размытие фона поисковика - выключено
  } as SearchSettings,

  fastLinks: {
    enabled: true, // Быстрые ссылки - включено
    columns: 6, // Количество колонок - 6
    globalTextColor: '', // Цвет заголовка - будет производным от акцентного
    globalBackdropColor: '', // Цвет задника - акцентный
    globalIconBackgroundColor: '', // Цвет фона иконки - акцентный
    hideIcons: false, // Скрыть иконки - нет
    hideText: false, // Скрыть текст - нет
    backdropBlur: 0, // Размытие фона - выключено
  } as FastLinkSettings,

  lists: {
    enabled: false, // Показывать списки ссылок - нет
    backgroundColor: '#FFFFFF', // Цвет фона - белый
    borderColor: '#000000', // Цвет границ - черный
    borderThickness: 2, // Толщина границ - 2 пикселя
    borderHidden: false, // Скрыть границу - нет
    backdropBlur: false, // Размытие фона - нет
    hideBackground: false, // Скрыть фон - нет
    separatorColor: '#000000', // Цвет разделителя - черный
    separatorThickness: 2, // Толщина разделителя - 2 пикселя
    separatorHidden: false, // Скрыть разделитель - нет
    titleColor: '#000000', // Цвет заголовка черный
    linkColor: '#000000', // Цвет ссылок черный
    hideIcons: false, // Скрыть иконки ссылок - нет
    gridColumns: 3, // Количество колонок - 3
  } as ListSettings,

  font: {
    fontFamily: 'system-ui', // Шрифт - системный
  } as FontSettings,

  radixTheme: '#000000', // Цвет акцента - черный
  radixRadius: 'medium', // Скругление - среднее
  cleanMode: false, // Чистый режим - выключен
  language: 'en' as LanguageCode, // Английский язык по умолчанию
};

// Старые настройки по умолчанию (для совместимости)
const defaultColors: ThemeColors = standardSettings.colors;
const defaultClockSettings: ClockSettings = standardSettings.clock;
const defaultListSettings: ListSettings = standardSettings.lists;
const defaultSearchSettings: SearchSettings = standardSettings.search;
const defaultFontSettings: FontSettings = standardSettings.font;
const defaultFastLinkSettings: FastLinkSettings = standardSettings.fastLinks;

function getThemeFromStorage(): ThemeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        colors: { ...defaultColors, ...parsed.colors },
        clock: { ...defaultClockSettings, ...parsed.clock },
        lists: { ...defaultListSettings, ...parsed.lists },
        search: { ...defaultSearchSettings, ...parsed.search },
        font: { ...defaultFontSettings, ...parsed.font },
        fastLinks: { ...defaultFastLinkSettings, ...parsed.fastLinks },
        radixTheme: parsed.radixTheme || STANDARD_THEME_COLOR, // По умолчанию черный цвет
        radixRadius: parsed.radixRadius || 'medium', // По умолчанию medium радиус
        presets: parsed.presets || [], // Пустой массив по умолчанию
        activePresetId: parsed.activePresetId || null, // ID активного пресета
        cleanMode: parsed.cleanMode || false, // По умолчанию чистый режим выключен
        language: parsed.language || 'en' as LanguageCode // По умолчанию английский язык
      };
    }
    return { colors: defaultColors, clock: defaultClockSettings, lists: defaultListSettings, search: defaultSearchSettings, font: defaultFontSettings, fastLinks: defaultFastLinkSettings, radixTheme: STANDARD_THEME_COLOR, radixRadius: 'medium', presets: [], activePresetId: null, cleanMode: false, language: 'en' as LanguageCode };
  } catch {
    return { colors: defaultColors, clock: defaultClockSettings, lists: defaultListSettings, search: defaultSearchSettings, font: defaultFontSettings, fastLinks: defaultFastLinkSettings, radixTheme: STANDARD_THEME_COLOR, radixRadius: 'medium', presets: [], activePresetId: null, cleanMode: false, language: 'en' as LanguageCode };
  }
}

function saveThemeToStorage(colors: ThemeColors, clock: ClockSettings, lists: ListSettings, search: SearchSettings, font: FontSettings, fastLinks: FastLinkSettings, radixTheme: string, radixRadius: string, presets: Preset[], activePresetId: string | null, cleanMode: boolean, language: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors, clock, lists, search, font, fastLinks, radixTheme, radixRadius, presets, activePresetId, cleanMode, language }));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

// Вспомогательная функция для сохранения состояния
function saveState(state: ThemeState): void {
  saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.fastLinks, state.radixTheme, state.radixRadius, state.presets, state.activePresetId, state.cleanMode, state.language);
}

const initialState: ThemeState = {
  ...getThemeFromStorage(),
  radixRadius: getThemeFromStorage().radixRadius || 'medium'
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.colors.accent = action.payload;
      saveState(state);
    },
    setLinksColor: (state, action: PayloadAction<string>) => {
      state.colors.links = action.payload;
      saveState(state);
    },
    setClockColor: (state, action: PayloadAction<string>) => {
      state.colors.clock = action.payload;
      state.clock.color = action.payload; // Синхронизируем с настройками часов
      saveState(state);
    },
    setColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      state.colors = {
        ...state.colors,
        ...action.payload
      };
      saveState(state);
    },
    resetColors: (state) => {
      state.colors = defaultColors;
      // Сбрасываем цвет разделителя и границы к акцентному
      state.lists.separatorColor = '';
      state.lists.borderColor = '';
      saveState(state);
    },
    // Сброс к стандартным настройкам (старая функция для совместимости)
    resetToDefaultTheme: (state) => {
      state.radixTheme = STANDARD_THEME_COLOR;
      state.colors.clock = STANDARD_CLOCK_COLOR;
      state.clock.color = STANDARD_CLOCK_COLOR;
      state.lists.titleColor = '';
      state.lists.linkColor = '';
      state.lists.backgroundColor = STANDARD_LIST_BACKGROUND_COLOR;
      state.lists.separatorColor = '';
      state.lists.separatorHidden = false;
      state.lists.separatorThickness = 2;
      state.lists.borderColor = '';
      state.lists.borderHidden = true;
      state.lists.borderThickness = 1;
      state.lists.hideIcons = false;
      state.search = defaultSearchSettings;
      state.font = defaultFontSettings;
      state.fastLinks = defaultFastLinkSettings;
      saveState(state);
    },
    setRadixTheme: (state, action: PayloadAction<string>) => {
      const newAccentColor = action.payload;
      state.radixTheme = newAccentColor;

      // При изменении акцентного цвета НЕ устанавливаем его компонентам
      // Компоненты сами будут использовать новый акцентный цвет через fallback логику
      // Если цвет границы не установлен индивидуально, обновляем его
      if (!state.lists.borderColor) {
        // Цвет границы будет использовать новый акцентный цвет через CSS переменные
      }

      saveState(state);
    },
    setRadixRadius: (state, action: PayloadAction<string>) => {
      state.radixRadius = action.payload;
      saveState(state);
    },
    // Новые actions для настроек часов
    setClockEnabled: (state, action: PayloadAction<boolean>) => {
      state.clock.enabled = action.payload;
      saveState(state);
    },
    setClockShowSeconds: (state, action: PayloadAction<boolean>) => {
      state.clock.showSeconds = action.payload;
      saveState(state);
    },
    setClockShowDate: (state, action: PayloadAction<boolean>) => {
      state.clock.showDate = action.payload;
      saveState(state);
    },
    setClockSize: (state, action: PayloadAction<number>) => {
      state.clock.size = Math.max(0.5, Math.min(2.5, action.payload));
      saveState(state);
    },
    setClockSettings: (state, action: PayloadAction<Partial<ClockSettings>>) => {
      state.clock = {
        ...state.clock,
        ...action.payload
      };
      saveState(state);
    },
    resetClockSettings: (state) => {
      state.clock = defaultClockSettings;
      saveState(state);
    },
    // Новые actions для настроек списков
    setListEnabled: (state, action: PayloadAction<boolean>) => {
      state.lists.enabled = action.payload;
      saveState(state);
    },
    setListBackgroundColor: (state, action: PayloadAction<string>) => {
      state.lists.backgroundColor = action.payload;
      saveState(state);
    },
    setListBackdropBlur: (state, action: PayloadAction<boolean>) => {
      state.lists.backdropBlur = action.payload;
      saveState(state);
    },
    setListTitleColor: (state, action: PayloadAction<string>) => {
      state.lists.titleColor = action.payload;
      saveState(state);
    },
    setListLinkColor: (state, action: PayloadAction<string>) => {
      state.lists.linkColor = action.payload;
      saveState(state);
    },
    setListHideBackground: (state, action: PayloadAction<boolean>) => {
      state.lists.hideBackground = action.payload;
      saveState(state);
    },
    setListSeparatorColor: (state, action: PayloadAction<string>) => {
      state.lists.separatorColor = action.payload;
      saveState(state);
    },
    setListSeparatorHidden: (state, action: PayloadAction<boolean>) => {
      state.lists.separatorHidden = action.payload;
      saveState(state);
    },
    setListSeparatorThickness: (state, action: PayloadAction<number>) => {
      state.lists.separatorThickness = action.payload;
      saveState(state);
    },
    setListBorderColor: (state, action: PayloadAction<string>) => {
      state.lists.borderColor = action.payload;
      saveState(state);
    },
    setListBorderHidden: (state, action: PayloadAction<boolean>) => {
      state.lists.borderHidden = action.payload;
      saveState(state);
    },
    setListBorderThickness: (state, action: PayloadAction<number>) => {
      state.lists.borderThickness = action.payload;
      saveState(state);
    },
    setListHideIcons: (state, action: PayloadAction<boolean>) => {
      state.lists.hideIcons = action.payload;
      saveState(state);
    },
    setListGridColumns: (state, action: PayloadAction<number>) => {
      state.lists.gridColumns = Math.max(2, Math.min(10, action.payload));
      saveState(state);
    },
    setListSettings: (state, action: PayloadAction<Partial<ListSettings>>) => {
      state.lists = {
        ...state.lists,
        ...action.payload
      };
      saveState(state);
    },
    resetListSettings: (state) => {
      state.lists = defaultListSettings;
      saveState(state);
    },
    // Новые actions для настроек поиска
    setSearchVisible: (state, action: PayloadAction<boolean>) => {
      state.search.visible = action.payload;
      saveState(state);
    },
    setSearchBackgroundColor: (state, action: PayloadAction<string>) => {
      state.search.backgroundColor = action.payload;
      saveState(state);
    },
    setSearchBorderColor: (state, action: PayloadAction<string>) => {
      state.search.borderColor = action.payload;
      saveState(state);
    },
    setSearchTextColor: (state, action: PayloadAction<string>) => {
      state.search.textColor = action.payload;
      saveState(state);
    },
    setSearchEngine: (state, action: PayloadAction<string>) => {
      state.search.searchEngine = action.payload;
      saveState(state);
    },
    setSearchSize: (state, action: PayloadAction<number>) => {
      state.search.size = Math.max(0.8, Math.min(1.5, action.payload));
      saveState(state);
    },
    setSearchBackdropBlur: (state, action: PayloadAction<boolean>) => {
      state.search.backdropBlur = action.payload;
      saveState(state);
    },
    setSearchSettings: (state, action: PayloadAction<Partial<SearchSettings>>) => {
      state.search = {
        ...state.search,
        ...action.payload
      };
      saveState(state);
    },
    resetSearchSettings: (state) => {
      state.search = defaultSearchSettings;
      saveState(state);
    },
    // Новые actions для настроек шрифтов
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.font.fontFamily = action.payload;
      saveState(state);
    },
    setFontSettings: (state, action: PayloadAction<Partial<FontSettings>>) => {
      state.font = {
        ...state.font,
        ...action.payload
      };
      saveState(state);
    },
    resetFontSettings: (state) => {
      state.font = defaultFontSettings;
      saveState(state);
    },
    // Новые actions для работы с пресетами
    createPreset: (state, action: PayloadAction<{ name: string; backgroundData: any; individualStyles?: any; listStates?: any }>) => {
      const { name, backgroundData, individualStyles, listStates } = action.payload;
      const newPreset: Preset = {
        id: Date.now().toString(),
        name,
        data: {
          colors: { ...state.colors },
          clock: { ...state.clock },
          lists: { ...state.lists },
          search: { ...state.search },
          font: { ...state.font },
          fastLinks: { ...state.fastLinks },
          radixTheme: state.radixTheme,
          radixRadius: state.radixRadius,
          background: {
            ...backgroundData,
            // Не сохраняем галерею изображений и эффект параллакса в пресетах
            // parallaxEnabled: backgroundData.parallaxEnabled,
            shadowOverlay: backgroundData.shadowOverlay ? { ...backgroundData.shadowOverlay } : undefined,
            autoSwitch: backgroundData.autoSwitch ? { ...backgroundData.autoSwitch } : undefined,
            // images: backgroundData.images ? [...backgroundData.images] : undefined
          },
          // Сохраняем индивидуальные стили
          individualStyles: individualStyles ? {
            lists: individualStyles.lists ? { ...individualStyles.lists } : undefined,
            links: individualStyles.links ? { ...individualStyles.links } : undefined,
            fastLinks: individualStyles.fastLinks ? { ...individualStyles.fastLinks } : undefined
          } : undefined,
          // Сохраняем состояние активации списков
          listStates: listStates ? { ...listStates } : undefined
        },
        createdAt: Date.now()
      };
      state.presets.push(newPreset);
      saveState(state);
    },
    applyPreset: (state, action: PayloadAction<string>) => {
      const presetId = action.payload;
      const preset = state.presets.find(p => p.id === presetId);
      if (preset) {
        // Применяем все настройки темы
        state.colors = { ...preset.data.colors };
        state.clock = { ...preset.data.clock };
        state.lists = { ...preset.data.lists };
        state.search = { ...preset.data.search };
        state.font = { ...preset.data.font };
        state.fastLinks = { ...preset.data.fastLinks };
        state.radixTheme = preset.data.radixTheme;
        state.radixRadius = preset.data.radixRadius;

        // Устанавливаем активный пресет
        state.activePresetId = presetId;

        // Сохраняем все настройки включая фон
        saveState(state);
      }
    },
    applyPresetIndividualStyles: (_state, _action: PayloadAction<{ listStyles?: any; linkStyles?: any }>) => {
      // Это действие будет использоваться для применения индивидуальных стилей
      // Логика применения будет в компонентах
    },
    deletePreset: (state, action: PayloadAction<string>) => {
      const presetId = action.payload;

      // Если удаляем активный пресет, нужно переключиться на другой или сбросить
      if (state.activePresetId === presetId) {
        const remainingPresets = state.presets.filter(p => p.id !== presetId);

        if (remainingPresets.length > 0) {
          // Переключаемся на следующий пресет
          const nextPreset = remainingPresets[0];
          state.activePresetId = nextPreset.id;

          // Применяем настройки следующего пресета
          state.colors = { ...nextPreset.data.colors };
          state.clock = { ...nextPreset.data.clock };
          state.lists = { ...nextPreset.data.lists };
          state.search = { ...nextPreset.data.search };
          state.font = { ...nextPreset.data.font };
          state.fastLinks = { ...nextPreset.data.fastLinks };
          state.radixTheme = nextPreset.data.radixTheme;
        } else {
          // Если пресетов не осталось, сбрасываем к дефолтным настройкам
          state.activePresetId = null;
          state.colors = { ...defaultColors };
          state.clock = { ...defaultClockSettings };
          state.lists = { ...defaultListSettings };
          state.search = { ...defaultSearchSettings };
          state.font = { ...defaultFontSettings };
          state.fastLinks = { ...defaultFastLinkSettings };
          state.radixTheme = '#86EFAC';
        }
      }

      // Удаляем пресет
      state.presets = state.presets.filter(p => p.id !== presetId);
      saveState(state);
    },
    // Новое действие для удаления пресета с применением фона
    deletePresetWithBackground: (state, action: PayloadAction<string>) => {
      const presetId = action.payload;

      // Если удаляем активный пресет, нужно переключиться на другой или сбросить
      if (state.activePresetId === presetId) {
        const remainingPresets = state.presets.filter(p => p.id !== presetId);

        if (remainingPresets.length > 0) {
          // Переключаемся на следующий пресет
          const nextPreset = remainingPresets[0];
          state.activePresetId = nextPreset.id;

          // Применяем настройки следующего пресета
          state.colors = { ...nextPreset.data.colors };
          state.clock = { ...nextPreset.data.clock };
          state.lists = { ...nextPreset.data.lists };
          state.search = { ...nextPreset.data.search };
          state.font = { ...nextPreset.data.font };
          state.fastLinks = { ...nextPreset.data.fastLinks };
          state.radixTheme = nextPreset.data.radixTheme;
          state.radixRadius = nextPreset.data.radixRadius;

          // Сохраняем информацию о следующем пресете для применения фона
          (state as any)._nextPresetToApply = nextPreset;
        } else {
          // Если пресетов не осталось, сбрасываем к дефолтным настройкам
          state.activePresetId = null;
          state.colors = { ...defaultColors };
          state.clock = { ...defaultClockSettings };
          state.lists = { ...defaultListSettings };
          state.search = { ...defaultSearchSettings };
          state.font = { ...defaultFontSettings };
          state.fastLinks = { ...defaultFastLinkSettings };
          state.radixTheme = '#86EFAC';
          state.radixRadius = 'medium';

          // Указываем, что нужно сбросить фон
          (state as any)._resetBackground = true;
        }
      }

      // Удаляем пресет
      state.presets = state.presets.filter(p => p.id !== presetId);
      saveState(state);
    },
    renamePreset: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const { id, name } = action.payload;
      const preset = state.presets.find(p => p.id === id);
      if (preset) {
        preset.name = name;
        saveState(state);
      }
    },
    updatePreset: (state, action: PayloadAction<{ id: string; backgroundData: any; individualStyles?: any; listStates?: any }>) => {
      const { id, backgroundData, individualStyles, listStates } = action.payload;
      const preset = state.presets.find(p => p.id === id);
      if (preset) {
        // Обновляем все настройки пресета текущими значениями
        preset.data = {
          colors: { ...state.colors },
          clock: { ...state.clock },
          lists: { ...state.lists },
          search: { ...state.search },
          font: { ...state.font },
          fastLinks: { ...state.fastLinks },
          radixTheme: state.radixTheme,
          radixRadius: state.radixRadius,
          background: {
            ...backgroundData,
            // Не сохраняем галерею изображений и эффект параллакса в пресетах
            // parallaxEnabled: backgroundData.parallaxEnabled,
            shadowOverlay: backgroundData.shadowOverlay ? { ...backgroundData.shadowOverlay } : undefined,
            autoSwitch: backgroundData.autoSwitch ? { ...backgroundData.autoSwitch } : undefined,
            // images: backgroundData.images ? [...backgroundData.images] : undefined
          },
          individualStyles: individualStyles ? {
            lists: individualStyles.lists ? { ...individualStyles.lists } : undefined,
            links: individualStyles.links ? { ...individualStyles.links } : undefined,
            fastLinks: individualStyles.fastLinks ? { ...individualStyles.fastLinks } : undefined
          } : undefined,
          // Обновляем состояние активации списков
          listStates: listStates ? { ...listStates } : undefined
        };
        saveState(state);
      }
    },
    // Actions для быстрых ссылок
    setFastLinksEnabled: (state, action: PayloadAction<boolean>) => {
      state.fastLinks.enabled = action.payload;
      saveState(state);
    },
    setFastLinksColumns: (state, action: PayloadAction<number>) => {
      state.fastLinks.columns = Math.max(2, Math.min(12, action.payload));
      saveState(state);
    },
    setFastLinksGlobalTextColor: (state, action: PayloadAction<string>) => {
      state.fastLinks.globalTextColor = action.payload;
      saveState(state);
    },
    setFastLinksGlobalBackdropColor: (state, action: PayloadAction<string>) => {
      state.fastLinks.globalBackdropColor = action.payload;
      saveState(state);
    },
    setFastLinksGlobalIconBackgroundColor: (state, action: PayloadAction<string>) => {
      state.fastLinks.globalIconBackgroundColor = action.payload;
      saveState(state);
    },
    setFastLinksHideIcons: (state, action: PayloadAction<boolean>) => {
      state.fastLinks.hideIcons = action.payload;
      // Если скрываем иконки, автоматически показываем текст
      if (action.payload && state.fastLinks.hideText) {
        state.fastLinks.hideText = false;
      }
      saveState(state);
    },
    setFastLinksHideText: (state, action: PayloadAction<boolean>) => {
      state.fastLinks.hideText = action.payload;
      // Если скрываем текст, автоматически показываем иконки
      if (action.payload && state.fastLinks.hideIcons) {
        state.fastLinks.hideIcons = false;
      }
      saveState(state);
    },
    setFastLinksBackdropBlur: (state, action: PayloadAction<number>) => {
      state.fastLinks.backdropBlur = Math.max(0, Math.min(20, action.payload));
      saveState(state);
    },

    setFastLinksSettings: (state, action: PayloadAction<Partial<FastLinkSettings>>) => {
      state.fastLinks = {
        ...state.fastLinks,
        ...action.payload
      };
      saveState(state);
    },
    resetFastLinksSettings: (state) => {
      state.fastLinks = defaultFastLinkSettings;
      saveState(state);
    },
    // Глобальный сброс всех цветов к акцентному
    resetAllColorsToAccent: (state) => {
      // Очищаем ВСЕ индивидуальные цвета - компоненты будут использовать акцентный через fallback

      // Очищаем цвета часов
      state.clock.color = '';

      // Очищаем цвета списков
      state.lists.linkColor = '';
      state.lists.titleColor = '';
      state.lists.separatorColor = '';
      state.lists.borderColor = '';

      // Очищаем цвета поиска
      state.search.backgroundColor = '';
      state.search.borderColor = '';
      state.search.textColor = '';

      // Очищаем цвета быстрых ссылок
      state.fastLinks.globalTextColor = '';
      state.fastLinks.globalBackdropColor = '';
      state.fastLinks.globalIconBackgroundColor = '';

      saveState(state);
    },
    // Сброс активного пресета (при изменении настроек вручную)
    clearActivePreset: (state) => {
      state.activePresetId = null;
      saveState(state);
    },
    // Чистый режим
    setCleanMode: (state, action: PayloadAction<boolean>) => {
      state.cleanMode = action.payload;
      saveState(state);
    },
    // Язык интерфейса
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
      saveState(state);
    },
    // Полный сброс всех настроек к стандартным значениям
    resetAllSettings: (state) => {
      state.colors = { ...standardSettings.colors };
      state.clock = { ...standardSettings.clock };
      state.lists = { ...standardSettings.lists };
      state.search = { ...standardSettings.search };
      state.font = { ...standardSettings.font };
      state.fastLinks = { ...standardSettings.fastLinks };
      state.radixTheme = standardSettings.radixTheme;
      state.radixRadius = standardSettings.radixRadius;
      state.presets = [];
      state.cleanMode = standardSettings.cleanMode;
      state.language = standardSettings.language;
      saveState(state);
    },
    // Функция больше не нужна - цвета обновляются автоматически через fallback в компонентах
    updateLinkedColors: (state) => {
      // Ничего не делаем - компоненты сами используют акцентный цвет через fallback
      saveState(state);
    },

    // Применение всех стандартных настроек (для первого запуска и сброса)
    applyAllStandardSettings: (state) => {
      // Применяем стандартные настройки темы
      state.colors = { ...standardSettings.colors };
      state.clock = { ...standardSettings.clock };
      state.lists = { ...standardSettings.lists };
      state.search = { ...standardSettings.search };
      state.font = { ...standardSettings.font };
      state.fastLinks = { ...standardSettings.fastLinks };
      state.radixTheme = standardSettings.radixTheme;
      state.radixRadius = standardSettings.radixRadius;
      state.cleanMode = standardSettings.cleanMode;
      state.language = standardSettings.language;

      // Очищаем ВСЕ индивидуальные цвета - компоненты будут использовать стандартные/акцентные через fallback
      state.clock.color = '';
      state.lists.linkColor = '';
      state.lists.titleColor = '';
      state.lists.separatorColor = '';
      state.lists.borderColor = '';
      state.search.backgroundColor = '';
      state.search.borderColor = '';
      state.search.textColor = '';
      state.fastLinks.globalTextColor = '';
      state.fastLinks.globalBackdropColor = '';
      state.fastLinks.globalIconBackgroundColor = '';

      // Сохраняем настройки в localStorage
      saveState(state);
    },

    // Комплексный сброс всех настроек включая фон, списки и быстрые ссылки
    resetToStandardSettings: (state) => {
      // Полностью очищаем localStorage от всех данных приложения
      clearAllLocalStorage();

      // Применяем все стандартные настройки
      // Используем ту же логику, что и в applyAllStandardSettings
      state.colors = { ...standardSettings.colors };
      state.clock = { ...standardSettings.clock };
      state.lists = { ...standardSettings.lists };
      state.search = { ...standardSettings.search };
      state.font = { ...standardSettings.font };
      state.fastLinks = { ...standardSettings.fastLinks };
      state.radixTheme = standardSettings.radixTheme;
      state.radixRadius = standardSettings.radixRadius;
      state.presets = [];
      state.cleanMode = standardSettings.cleanMode;
      state.language = standardSettings.language;

      // Очищаем ВСЕ индивидуальные цвета - компоненты будут использовать стандартные/акцентные через fallback
      state.clock.color = '';
      state.lists.titleColor = '';
      state.lists.linkColor = '';
      state.lists.separatorColor = '';
      state.lists.borderColor = '';
      state.search.backgroundColor = '';
      state.search.borderColor = '';
      state.search.textColor = '';
      state.fastLinks.globalTextColor = '';
      state.fastLinks.globalBackdropColor = '';
      state.fastLinks.globalIconBackgroundColor = '';

      // Сохраняем стандартные настройки в localStorage
      saveState(state);
    },
  },
});

export const {
  setAccentColor,
  setLinksColor,
  setClockColor,
  setColors,
  resetColors,
  resetToDefaultTheme,
  setRadixTheme,
  setRadixRadius,
  setClockEnabled,
  setClockShowSeconds,
  setClockShowDate,
  setClockSize,
  setClockSettings,
  resetClockSettings,
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
  setListSettings,
  resetListSettings,
  setSearchVisible,
  setSearchBackgroundColor,
  setSearchBorderColor,
  setSearchTextColor,
  setSearchEngine,
  setSearchSize,
  setSearchBackdropBlur,
  setSearchSettings,
  resetSearchSettings,
  setFontFamily,
  setFontSettings,
  resetFontSettings,
  setFastLinksEnabled,
  setFastLinksColumns,
  setFastLinksGlobalTextColor,
  setFastLinksGlobalBackdropColor,
  setFastLinksGlobalIconBackgroundColor,
  setFastLinksHideIcons,
  setFastLinksHideText,
  setFastLinksBackdropBlur,
  setFastLinksSettings,
  resetFastLinksSettings,
  resetAllColorsToAccent,
  createPreset,
  applyPreset,
  applyPresetIndividualStyles,
  deletePreset,
  deletePresetWithBackground,
  renamePreset,
  updatePreset,
  clearActivePreset,
  setCleanMode,
  setLanguage,
  resetAllSettings,
  resetToStandardSettings,
  applyAllStandardSettings,
  updateLinkedColors
} = themeSlice.actions;

export default themeSlice.reducer;
