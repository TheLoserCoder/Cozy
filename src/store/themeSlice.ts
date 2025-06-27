import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

export interface PresetData {
  colors: ThemeColors;
  clock: ClockSettings;
  lists: ListSettings;
  search: SearchSettings;
  font: FontSettings;
  radixTheme: string;
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
  radixTheme: string; // Кастомный цвет для Radix темы
  presets: Preset[]; // Сохраненные пресеты
}

// Функции для работы с localStorage
const STORAGE_KEY = 'theme-colors';

// Стандартные настройки цветов
const DEFAULT_THEME_COLOR = '#3E63DD'; // Индиго
const DEFAULT_CLOCK_COLOR = '#FFFFFF'; // Белый
const DEFAULT_LIST_BACKGROUND_COLOR = '#FFFFFF'; // Белый фон для списков

const defaultColors: ThemeColors = {
  accent: '#00A2E8', // Дефолтный синий
  links: '#1a1a1a', // Дефолтный темный
  clock: '#1a1a1a', // Дефолтный темный
};

const defaultClockSettings: ClockSettings = {
  enabled: true,
  showSeconds: false,
  showDate: true,
  size: 1.0, // нормальный размер
  color: '#1a1a1a',
};

const defaultListSettings: ListSettings = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Полупрозрачный белый
  backdropBlur: true,
  titleColor: '', // Пустая строка означает использование акцентного цвета
  linkColor: '', // Пустая строка означает использование общего цвета ссылок
  hideBackground: false, // По умолчанию фон видимый
  separatorColor: '', // Пустая строка означает использование акцентного цвета
  separatorHidden: false, // По умолчанию разделитель видимый
  separatorThickness: 2, // Средняя толщина по умолчанию
  borderColor: '', // Пустая строка означает отсутствие границы
  borderHidden: true, // По умолчанию границы скрыты
  borderThickness: 1, // Минимальная толщина по умолчанию
  hideIcons: false, // По умолчанию иконки видимы
};

const defaultSearchSettings: SearchSettings = {
  visible: true, // По умолчанию поисковик видимый
  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Полупрозрачный белый
  borderColor: '', // Пустая строка означает использование акцентного цвета
  textColor: '#FFFFFF', // Белый текст по умолчанию
  searchEngine: 'google', // Google по умолчанию
  size: 1.0, // Стандартный размер
  backdropBlur: true, // По умолчанию размытие включено
};

const defaultFontSettings: FontSettings = {
  fontFamily: 'system-ui', // Системный шрифт по умолчанию
};

function getThemeFromStorage(): { colors: ThemeColors; clock: ClockSettings; lists: ListSettings; search: SearchSettings; font: FontSettings; radixTheme: string; presets: Preset[] } {
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
        radixTheme: parsed.radixTheme || '#86EFAC', // По умолчанию mint цвет
        presets: parsed.presets || [] // Пустой массив по умолчанию
      };
    }
    return { colors: defaultColors, clock: defaultClockSettings, lists: defaultListSettings, search: defaultSearchSettings, font: defaultFontSettings, radixTheme: '#86EFAC', presets: [] };
  } catch {
    return { colors: defaultColors, clock: defaultClockSettings, lists: defaultListSettings, search: defaultSearchSettings, font: defaultFontSettings, radixTheme: '#86EFAC', presets: [] };
  }
}

function saveThemeToStorage(colors: ThemeColors, clock: ClockSettings, lists: ListSettings, search: SearchSettings, font: FontSettings, radixTheme: string, presets: Preset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors, clock, lists, search, font, radixTheme, presets }));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

const initialState: ThemeState = getThemeFromStorage();

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.colors.accent = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setLinksColor: (state, action: PayloadAction<string>) => {
      state.colors.links = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setClockColor: (state, action: PayloadAction<string>) => {
      state.colors.clock = action.payload;
      state.clock.color = action.payload; // Синхронизируем с настройками часов
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      state.colors = {
        ...state.colors,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    resetColors: (state) => {
      state.colors = defaultColors;
      // Сбрасываем цвет разделителя и границы к акцентному
      state.lists.separatorColor = '';
      state.lists.borderColor = '';
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    // Сброс к стандартным настройкам
    resetToDefaultTheme: (state) => {
      state.radixTheme = DEFAULT_THEME_COLOR;
      state.colors.clock = DEFAULT_CLOCK_COLOR;
      state.clock.color = DEFAULT_CLOCK_COLOR;
      state.lists.titleColor = '';
      state.lists.linkColor = '';
      state.lists.backgroundColor = DEFAULT_LIST_BACKGROUND_COLOR;
      state.lists.separatorColor = '';
      state.lists.separatorHidden = false;
      state.lists.separatorThickness = 2;
      state.lists.borderColor = '';
      state.lists.borderHidden = true;
      state.lists.borderThickness = 1;
      state.lists.hideIcons = false;
      state.search = defaultSearchSettings;
      state.font = defaultFontSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setRadixTheme: (state, action: PayloadAction<string>) => {
      state.radixTheme = action.payload;
      // Если цвет разделителя не установлен индивидуально, обновляем его
      if (!state.lists.separatorColor) {
        // Цвет разделителя будет использовать новый акцентный цвет через CSS переменные
      }
      // Если цвет границы не установлен индивидуально, обновляем его
      if (!state.lists.borderColor) {
        // Цвет границы будет использовать новый акцентный цвет через CSS переменные
      }
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    // Новые actions для настроек часов
    setClockEnabled: (state, action: PayloadAction<boolean>) => {
      state.clock.enabled = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setClockShowSeconds: (state, action: PayloadAction<boolean>) => {
      state.clock.showSeconds = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setClockShowDate: (state, action: PayloadAction<boolean>) => {
      state.clock.showDate = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setClockSize: (state, action: PayloadAction<number>) => {
      state.clock.size = Math.max(0.5, Math.min(2.5, action.payload));
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setClockSettings: (state, action: PayloadAction<Partial<ClockSettings>>) => {
      state.clock = {
        ...state.clock,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    resetClockSettings: (state) => {
      state.clock = defaultClockSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    // Новые actions для настроек списков
    setListBackgroundColor: (state, action: PayloadAction<string>) => {
      state.lists.backgroundColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListBackdropBlur: (state, action: PayloadAction<boolean>) => {
      state.lists.backdropBlur = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListTitleColor: (state, action: PayloadAction<string>) => {
      state.lists.titleColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListLinkColor: (state, action: PayloadAction<string>) => {
      state.lists.linkColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListHideBackground: (state, action: PayloadAction<boolean>) => {
      state.lists.hideBackground = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListSeparatorColor: (state, action: PayloadAction<string>) => {
      state.lists.separatorColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListSeparatorHidden: (state, action: PayloadAction<boolean>) => {
      state.lists.separatorHidden = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListSeparatorThickness: (state, action: PayloadAction<number>) => {
      state.lists.separatorThickness = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListBorderColor: (state, action: PayloadAction<string>) => {
      state.lists.borderColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListBorderHidden: (state, action: PayloadAction<boolean>) => {
      state.lists.borderHidden = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListBorderThickness: (state, action: PayloadAction<number>) => {
      state.lists.borderThickness = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListHideIcons: (state, action: PayloadAction<boolean>) => {
      state.lists.hideIcons = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setListSettings: (state, action: PayloadAction<Partial<ListSettings>>) => {
      state.lists = {
        ...state.lists,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    resetListSettings: (state) => {
      state.lists = defaultListSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    // Новые actions для настроек поиска
    setSearchVisible: (state, action: PayloadAction<boolean>) => {
      state.search.visible = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchBackgroundColor: (state, action: PayloadAction<string>) => {
      state.search.backgroundColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchBorderColor: (state, action: PayloadAction<string>) => {
      state.search.borderColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchTextColor: (state, action: PayloadAction<string>) => {
      state.search.textColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchEngine: (state, action: PayloadAction<string>) => {
      state.search.searchEngine = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchSize: (state, action: PayloadAction<number>) => {
      state.search.size = Math.max(0.8, Math.min(1.5, action.payload));
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchBackdropBlur: (state, action: PayloadAction<boolean>) => {
      state.search.backdropBlur = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setSearchSettings: (state, action: PayloadAction<Partial<SearchSettings>>) => {
      state.search = {
        ...state.search,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    resetSearchSettings: (state) => {
      state.search = defaultSearchSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    // Новые actions для настроек шрифтов
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.font.fontFamily = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    setFontSettings: (state, action: PayloadAction<Partial<FontSettings>>) => {
      state.font = {
        ...state.font,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    resetFontSettings: (state) => {
      state.font = defaultFontSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
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
          radixTheme: state.radixTheme,
          background: {
            ...backgroundData,
            // Сохраняем дополнительные настройки фона
            parallaxEnabled: backgroundData.parallaxEnabled,
            shadowOverlay: backgroundData.shadowOverlay ? { ...backgroundData.shadowOverlay } : undefined,
            autoSwitch: backgroundData.autoSwitch ? { ...backgroundData.autoSwitch } : undefined,
            images: backgroundData.images ? [...backgroundData.images] : undefined
          },
          // Сохраняем индивидуальные стили
          individualStyles: individualStyles ? {
            lists: individualStyles.lists ? { ...individualStyles.lists } : undefined,
            links: individualStyles.links ? { ...individualStyles.links } : undefined
          } : undefined,
          // Сохраняем состояние активации списков
          listStates: listStates ? { ...listStates } : undefined
        },
        createdAt: Date.now()
      };
      state.presets.push(newPreset);
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    applyPreset: (state, action: PayloadAction<string>) => {
      const presetId = action.payload;
      const preset = state.presets.find(p => p.id === presetId);
      if (preset) {
        state.colors = { ...preset.data.colors };
        state.clock = { ...preset.data.clock };
        state.lists = { ...preset.data.lists };
        state.search = { ...preset.data.search };
        state.font = { ...preset.data.font };
        state.radixTheme = preset.data.radixTheme;
        saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
      }
    },
    applyPresetIndividualStyles: (state, action: PayloadAction<{ listStyles?: any; linkStyles?: any }>) => {
      // Это действие будет использоваться для применения индивидуальных стилей
      // Логика применения будет в компонентах
    },
    deletePreset: (state, action: PayloadAction<string>) => {
      const presetId = action.payload;
      state.presets = state.presets.filter(p => p.id !== presetId);
      saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
    },
    renamePreset: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const { id, name } = action.payload;
      const preset = state.presets.find(p => p.id === id);
      if (preset) {
        preset.name = name;
        saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
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
          radixTheme: state.radixTheme,
          background: {
            ...backgroundData,
            parallaxEnabled: backgroundData.parallaxEnabled,
            shadowOverlay: backgroundData.shadowOverlay ? { ...backgroundData.shadowOverlay } : undefined,
            autoSwitch: backgroundData.autoSwitch ? { ...backgroundData.autoSwitch } : undefined,
            images: backgroundData.images ? [...backgroundData.images] : undefined
          },
          individualStyles: individualStyles ? {
            lists: individualStyles.lists ? { ...individualStyles.lists } : undefined,
            links: individualStyles.links ? { ...individualStyles.links } : undefined
          } : undefined,
          // Обновляем состояние активации списков
          listStates: listStates ? { ...listStates } : undefined
        };
        saveThemeToStorage(state.colors, state.clock, state.lists, state.search, state.font, state.radixTheme, state.presets);
      }
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
  setClockEnabled,
  setClockShowSeconds,
  setClockShowDate,
  setClockSize,
  setClockSettings,
  resetClockSettings,
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
  createPreset,
  applyPreset,
  applyPresetIndividualStyles,
  deletePreset,
  renamePreset,
  updatePreset
} = themeSlice.actions;

export default themeSlice.reducer;
