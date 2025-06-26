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

interface ThemeState {
  colors: ThemeColors;
  clock: ClockSettings;
  lists: ListSettings;
  radixTheme: string; // Кастомный цвет для Radix темы
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

function getThemeFromStorage(): { colors: ThemeColors; clock: ClockSettings; lists: ListSettings; radixTheme: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        colors: { ...defaultColors, ...parsed.colors },
        clock: { ...defaultClockSettings, ...parsed.clock },
        lists: { ...defaultListSettings, ...parsed.lists },
        radixTheme: parsed.radixTheme || '#86EFAC' // По умолчанию mint цвет
      };
    }
    return { colors: defaultColors, clock: defaultClockSettings, lists: defaultListSettings, radixTheme: '#86EFAC' };
  } catch {
    return { colors: defaultColors, clock: defaultClockSettings, lists: defaultListSettings, radixTheme: '#86EFAC' };
  }
}

function saveThemeToStorage(colors: ThemeColors, clock: ClockSettings, lists: ListSettings, radixTheme: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors, clock, lists, radixTheme }));
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
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setLinksColor: (state, action: PayloadAction<string>) => {
      state.colors.links = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setClockColor: (state, action: PayloadAction<string>) => {
      state.colors.clock = action.payload;
      state.clock.color = action.payload; // Синхронизируем с настройками часов
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      state.colors = {
        ...state.colors,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    resetColors: (state) => {
      state.colors = defaultColors;
      // Сбрасываем цвет разделителя и границы к акцентному
      state.lists.separatorColor = '';
      state.lists.borderColor = '';
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
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
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setRadixTheme: (state, action: PayloadAction<string>) => {
      state.radixTheme = action.payload;
      // Если цвет разделителя не установлен индивидуально, обновляем его
      if (!state.lists.separatorColor) {
        // Цвет разделителя будет использовать новый акцентный цвет через CSS переменные
      }
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    // Новые actions для настроек часов
    setClockEnabled: (state, action: PayloadAction<boolean>) => {
      state.clock.enabled = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setClockShowSeconds: (state, action: PayloadAction<boolean>) => {
      state.clock.showSeconds = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setClockShowDate: (state, action: PayloadAction<boolean>) => {
      state.clock.showDate = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setClockSize: (state, action: PayloadAction<number>) => {
      state.clock.size = Math.max(0.5, Math.min(2.5, action.payload));
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setClockSettings: (state, action: PayloadAction<Partial<ClockSettings>>) => {
      state.clock = {
        ...state.clock,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    resetClockSettings: (state) => {
      state.clock = defaultClockSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    // Новые actions для настроек списков
    setListBackgroundColor: (state, action: PayloadAction<string>) => {
      state.lists.backgroundColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListBackdropBlur: (state, action: PayloadAction<boolean>) => {
      state.lists.backdropBlur = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListTitleColor: (state, action: PayloadAction<string>) => {
      state.lists.titleColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListLinkColor: (state, action: PayloadAction<string>) => {
      state.lists.linkColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListHideBackground: (state, action: PayloadAction<boolean>) => {
      state.lists.hideBackground = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListSeparatorColor: (state, action: PayloadAction<string>) => {
      state.lists.separatorColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListSeparatorHidden: (state, action: PayloadAction<boolean>) => {
      state.lists.separatorHidden = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListSeparatorThickness: (state, action: PayloadAction<number>) => {
      state.lists.separatorThickness = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListBorderColor: (state, action: PayloadAction<string>) => {
      state.lists.borderColor = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListBorderHidden: (state, action: PayloadAction<boolean>) => {
      state.lists.borderHidden = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListBorderThickness: (state, action: PayloadAction<number>) => {
      state.lists.borderThickness = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListHideIcons: (state, action: PayloadAction<boolean>) => {
      state.lists.hideIcons = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    setListSettings: (state, action: PayloadAction<Partial<ListSettings>>) => {
      state.lists = {
        ...state.lists,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
    },
    resetListSettings: (state) => {
      state.lists = defaultListSettings;
      saveThemeToStorage(state.colors, state.clock, state.lists, state.radixTheme);
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
  resetListSettings
} = themeSlice.actions;

export default themeSlice.reducer;
