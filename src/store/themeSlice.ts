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
  size: number; // от 0.5 до 2.0
  color: string;
}

interface ThemeState {
  colors: ThemeColors;
  clock: ClockSettings;
  radixTheme: string; // Выбранная Radix цветовая схема
}

// Функции для работы с localStorage
const STORAGE_KEY = 'theme-colors';

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

function getThemeFromStorage(): { colors: ThemeColors; clock: ClockSettings; radixTheme: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        colors: { ...defaultColors, ...parsed.colors },
        clock: { ...defaultClockSettings, ...parsed.clock },
        radixTheme: parsed.radixTheme || 'mint'
      };
    }
    return { colors: defaultColors, clock: defaultClockSettings, radixTheme: 'mint' };
  } catch {
    return { colors: defaultColors, clock: defaultClockSettings, radixTheme: 'mint' };
  }
}

function saveThemeToStorage(colors: ThemeColors, clock: ClockSettings, radixTheme: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors, clock, radixTheme }));
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
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setLinksColor: (state, action: PayloadAction<string>) => {
      state.colors.links = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setClockColor: (state, action: PayloadAction<string>) => {
      state.colors.clock = action.payload;
      state.clock.color = action.payload; // Синхронизируем с настройками часов
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setColors: (state, action: PayloadAction<Partial<ThemeColors>>) => {
      state.colors = {
        ...state.colors,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    resetColors: (state) => {
      state.colors = defaultColors;
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setRadixTheme: (state, action: PayloadAction<string>) => {
      state.radixTheme = action.payload;
      // Также обновляем акцентный цвет, чтобы он соответствовал Radix теме
      // Используем цвет из предварительного просмотра
      const colorMap: Record<string, string> = {
        gray: '#8B8D98', gold: '#978365', bronze: '#A18072', brown: '#AD7F58',
        yellow: '#FFE629', amber: '#FFC53D', orange: '#FF8B3E', tomato: '#FF6154',
        red: '#E5484D', ruby: '#E54666', crimson: '#E93D82', pink: '#D6409F',
        plum: '#AB4ABA', purple: '#8E4EC6', violet: '#6E56CF', iris: '#5B5BD6',
        indigo: '#3E63DD', blue: '#0090FF', cyan: '#00A2C7', teal: '#12A594',
        jade: '#29A383', green: '#46A758', grass: '#5CBB5C', lime: '#BDEE63',
        mint: '#86EFAC', sky: '#7CE2FE'
      };
      state.colors.accent = colorMap[action.payload] || '#00A2E8';
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    // Новые actions для настроек часов
    setClockEnabled: (state, action: PayloadAction<boolean>) => {
      state.clock.enabled = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setClockShowSeconds: (state, action: PayloadAction<boolean>) => {
      state.clock.showSeconds = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setClockShowDate: (state, action: PayloadAction<boolean>) => {
      state.clock.showDate = action.payload;
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setClockSize: (state, action: PayloadAction<number>) => {
      state.clock.size = Math.max(0.5, Math.min(2.0, action.payload));
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    setClockSettings: (state, action: PayloadAction<Partial<ClockSettings>>) => {
      state.clock = {
        ...state.clock,
        ...action.payload
      };
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
    resetClockSettings: (state) => {
      state.clock = defaultClockSettings;
      saveThemeToStorage(state.colors, state.clock, state.radixTheme);
    },
  },
});

export const {
  setAccentColor,
  setLinksColor,
  setClockColor,
  setColors,
  resetColors,
  setRadixTheme,
  setClockEnabled,
  setClockShowSeconds,
  setClockShowDate,
  setClockSize,
  setClockSettings,
  resetClockSettings
} = themeSlice.actions;

export default themeSlice.reducer;
