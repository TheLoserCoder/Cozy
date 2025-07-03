import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FastLink } from "../entities/list/list.types";
import { getFaviconUrl } from "../utils/favicon";

// Функции для работы с localStorage
const STORAGE_KEY = 'fast-links';

function getFastLinksFromStorage(): FastLink[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Ошибка при загрузке быстрых ссылок из localStorage:', error);
  }
  // При первом запуске возвращаем стандартные быстрые ссылки
  return [...standardFastLinks];
}

function saveFastLinksToStorage(fastLinks: FastLink[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fastLinks));
  } catch (error) {
    console.error('Ошибка при сохранении быстрых ссылок в localStorage:', error);
  }
}

// Стандартные быстрые ссылки для кнопки сброса
export const standardFastLinks: FastLink[] = [
  {
    id: "readme-fast",
    url: "https://github.com/TheLoserCoder/Listify/blob/main/README.md",
    title: "README",
    iconUrl: getFaviconUrl("https://github.com/"),
  },
];

const initialState: FastLink[] = getFastLinksFromStorage();

const fastLinksSlice = createSlice({
  name: "fastLinks",
  initialState,
  reducers: {
    addFastLink(state, action: PayloadAction<FastLink>) {
      state.push(action.payload);
      saveFastLinksToStorage(state);
    },
    setFastLinks(_state, action: PayloadAction<FastLink[]>) {
      const newState = action.payload;
      saveFastLinksToStorage(newState);
      return newState;
    },
    editFastLink(state, action: PayloadAction<{ id: string; title?: string; url?: string; customTextColor?: string; customBackdropColor?: string; customIconBackgroundColor?: string; iconId?: string; iconType?: 'standard' | 'custom' | 'favicon'; iconColor?: string }>) {
      const { id, title, url, customTextColor, customBackdropColor, customIconBackgroundColor, iconId, iconType, iconColor } = action.payload;
      const fastLink = state.find(link => link.id === id);
      if (fastLink) {
        if (title !== undefined) fastLink.title = title;
        if (url !== undefined) {
          fastLink.url = url;
          // Обновляем favicon только если нет пользовательской иконки
          if (!fastLink.iconId || fastLink.iconType === 'favicon') {
            fastLink.iconUrl = getFaviconUrl(url);
          }
        }
        if (customTextColor !== undefined) {
          fastLink.customTextColor = customTextColor === "" ? undefined : customTextColor;
        }
        if (customBackdropColor !== undefined) {
          fastLink.customBackdropColor = customBackdropColor === "" ? undefined : customBackdropColor;
        }
        if (customIconBackgroundColor !== undefined) {
          fastLink.customIconBackgroundColor = customIconBackgroundColor === "" ? undefined : customIconBackgroundColor;
        }
        if (iconId !== undefined) {
          fastLink.iconId = iconId === "" ? undefined : iconId;
        }
        if (iconType !== undefined) {
          fastLink.iconType = iconType;
        }
        if (iconColor !== undefined) {
          fastLink.iconColor = iconColor === "" ? undefined : iconColor;
        }
        saveFastLinksToStorage(state);
      }
    },
    deleteFastLink(state, action: PayloadAction<string>) {
      const index = state.findIndex(link => link.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
        saveFastLinksToStorage(state);
      }
    },
    reorderFastLinks(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      if (from >= 0 && from < state.length && to >= 0 && to < state.length) {
        const [removed] = state.splice(from, 1);
        state.splice(to, 0, removed);
        saveFastLinksToStorage(state);
      }
    },
    resetFastLinkColors(state, action: PayloadAction<string>) {
      const fastLink = state.find(link => link.id === action.payload);
      if (fastLink) {
        fastLink.customTextColor = undefined;
        fastLink.customBackdropColor = undefined;
        fastLink.customIconBackgroundColor = undefined;
        saveFastLinksToStorage(state);
      }
    },
    resetFastLinkIcon(state, action: PayloadAction<string>) {
      const fastLink = state.find(link => link.id === action.payload);
      if (fastLink) {
        fastLink.iconId = undefined;
        fastLink.iconType = 'favicon';
        // Восстанавливаем favicon
        fastLink.iconUrl = getFaviconUrl(fastLink.url);
        saveFastLinksToStorage(state);
      }
    },
    resetAllFastLinkColors(state) {
      state.forEach(link => {
        link.customTextColor = undefined;
        link.customBackdropColor = undefined;
        link.customIconBackgroundColor = undefined;
      });
      saveFastLinksToStorage(state);
    },
    resetAllFastLinkIcons(state) {
      state.forEach(link => {
        link.iconId = undefined;
        link.iconType = 'favicon';
        link.iconUrl = getFaviconUrl(link.url);
      });
      saveFastLinksToStorage(state);
    },
    updateGlobalBackgroundColor(_state, _action: PayloadAction<string>) {
      // Этот action будет вызываться при изменении акцентного цвета
      // Он не изменяет данные в fastLinksSlice, но может использоваться для логики
      // Фактическое обновление цветов происходит через CSS переменные
    },
    // Сброс к стандартным быстрым ссылкам
    resetToStandardFastLinks(_state) {
      const newState = [...standardFastLinks];
      saveFastLinksToStorage(newState);
      return newState;
    },
    resetAllFastLinkIndividualColors(state) {
      // Сбрасываем все индивидуальные цвета быстрых ссылок
      state.forEach(link => {
        link.customTextColor = undefined;
        link.customBackdropColor = undefined;
        link.customIconBackgroundColor = undefined;
        link.iconColor = undefined; // Сбрасываем индивидуальный цвет иконки
      });
      saveFastLinksToStorage(state);
    },
    applyFastLinkStyles(state, action: PayloadAction<{ [fastLinkId: string]: any }>) {
      // Применяем индивидуальные стили быстрых ссылок из пресета
      const fastLinkStyles = action.payload;

      state.forEach(fastLink => {
        const presetStyle = fastLinkStyles[fastLink.id];
        if (presetStyle) {
          // Применяем все стили из пресета, включая undefined для сброса
          fastLink.customTextColor = presetStyle.customTextColor;
          fastLink.customBackdropColor = presetStyle.customBackdropColor;
          fastLink.customIconBackgroundColor = presetStyle.customIconBackgroundColor;
          fastLink.iconId = presetStyle.iconId;
          fastLink.iconType = presetStyle.iconType;
          fastLink.iconColor = presetStyle.iconColor;
        }
      });
      saveFastLinksToStorage(state);
    },
    updateFastLinkIcon(state, action: PayloadAction<{ id: string; iconId: string }>) {
      // Обновляем иконку быстрой ссылки после скачивания favicon
      const { id, iconId } = action.payload;
      const fastLink = state.find(link => link.id === id);
      if (fastLink && fastLink.iconType === 'custom') {
        fastLink.iconId = iconId;
        saveFastLinksToStorage(state);
      }
    },
  },
});

export const {
  addFastLink,
  setFastLinks,
  editFastLink,
  deleteFastLink,
  reorderFastLinks,
  resetFastLinkColors,
  resetFastLinkIcon,
  resetAllFastLinkColors,
  resetAllFastLinkIcons,
  updateGlobalBackgroundColor,
  resetAllFastLinkIndividualColors,
  applyFastLinkStyles,
  resetToStandardFastLinks,
  updateFastLinkIcon
} = fastLinksSlice.actions;

export default fastLinksSlice.reducer;
