import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LinkList, LinkListItem } from "../entities/list/list.types";
import { getListsFromStorage, saveListsToStorage } from "../entities/list/list.storage";


// Дефолтные списки, если localStorage пуст
const defaultLists: LinkList[] = [];

// Стандартные списки для кнопки сброса (пустые)
export const standardLists: LinkList[] = [];

const storedLists = getListsFromStorage();
const initialState: LinkList[] = storedLists.length > 0 ? storedLists : defaultLists;

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    addList(state, action: PayloadAction<LinkList>) {
      state.push(action.payload);
      saveListsToStorage(state);
    },
    setLists(state, action: PayloadAction<LinkList[]>) {
      return action.payload;
    },
    editListTitle(state, action: PayloadAction<{ id: string; title: string }>) {
      const list = state.find(l => l.id === action.payload.id);
      if (list) {
        list.title = action.payload.title;
        saveListsToStorage(state);
      }
    },
    setListColor(state, action: PayloadAction<{ id: string; color?: string }>) {
      const list = state.find(l => l.id === action.payload.id);
      if (list) {
        list.customColor = action.payload.color;
        saveListsToStorage(state);
      }
    },
    setListSeparatorColor(state, action: PayloadAction<{ id: string; color?: string }>) {
      const list = state.find(l => l.id === action.payload.id);
      if (list) {
        list.customSeparatorColor = action.payload.color;
        saveListsToStorage(state);
      }
    },
    setListLinkColor(state, action: PayloadAction<{ id: string; color?: string }>) {
      const list = state.find(l => l.id === action.payload.id);
      if (list) {
        list.customLinkColor = action.payload.color;
        saveListsToStorage(state);
      }
    },
    setListIcon(state, action: PayloadAction<{ id: string; icon?: string }>) {
      const list = state.find(l => l.id === action.payload.id);
      if (list) {
        list.icon = action.payload.icon;
        saveListsToStorage(state);
      }
    },
    setListIconColor(state, action: PayloadAction<{ id: string; color?: string }>) {
      const list = state.find(l => l.id === action.payload.id);
      if (list) {
        list.iconColor = action.payload.color;
        saveListsToStorage(state);
      }
    },
    deleteList(state, action: PayloadAction<string>) {
      const idx = state.findIndex(l => l.id === action.payload);
      if (idx !== -1) {
        state.splice(idx, 1);
        saveListsToStorage(state);
      }
    },
    addLinkToList(state, action: PayloadAction<{ listId: string; link: LinkListItem }>) {
      const list = state.find(l => l.id === action.payload.listId);
      if (list) {
        list.links.push(action.payload.link);
        saveListsToStorage(state);
      }
    },
    editLink(state, action: PayloadAction<{ listId: string; linkId: string; updates: Partial<LinkListItem> }>) {
      const list = state.find(l => l.id === action.payload.listId);
      if (list) {
        const link = list.links.find(l => l.id === action.payload.linkId);
        if (link) {
          Object.assign(link, action.payload.updates);
          saveListsToStorage(state);
        }
      }
    },
    deleteLink(state, action: PayloadAction<{ listId: string; linkId: string }>) {
      const list = state.find(l => l.id === action.payload.listId);
      if (list) {
        list.links = list.links.filter(l => l.id !== action.payload.linkId);
        saveListsToStorage(state);
      }
    },
    setLinkColor(state, action: PayloadAction<{ listId: string; linkId: string; color?: string }>) {
      const list = state.find(l => l.id === action.payload.listId);
      if (list) {
        const link = list.links.find(l => l.id === action.payload.linkId);
        if (link) {
          link.customColor = action.payload.color;
          saveListsToStorage(state);
        }
      }
    },
    reorderLinksInList(state, action: PayloadAction<{ listId: string; from: number; to: number }>) {
      const list = state.find(l => l.id === action.payload.listId);
      if (list) {
        const [moved] = list.links.splice(action.payload.from, 1);
        list.links.splice(action.payload.to, 0, moved);
        saveListsToStorage(state);
      }
    },
    moveLinkToList(state, action: PayloadAction<{ fromListId: string; toListId: string; linkId: string; toIndex: number }>) {
      if (action.payload.fromListId === action.payload.toListId) return;
      const fromList = state.find(l => l.id === action.payload.fromListId);
      const toList = state.find(l => l.id === action.payload.toListId);
      if (!fromList || !toList) return;
      const linkIdx = fromList.links.findIndex(l => l.id === action.payload.linkId);
      if (linkIdx === -1) return;
      const [link] = fromList.links.splice(linkIdx, 1);
      toList.links.splice(action.payload.toIndex, 0, link);
      saveListsToStorage(state);
    },
    // Сброс всех индивидуальных цветов списков и ссылок
    resetAllCustomColors(state) {
      state.forEach(list => {
        // Сбрасываем цвет списка
        list.customColor = undefined;
        // Сбрасываем цвет разделителя списка
        list.customSeparatorColor = undefined;
        // Сбрасываем цвет ссылок списка
        list.customLinkColor = undefined;
        // Сбрасываем цвет иконки списка
        list.iconColor = undefined;
        // НЕ сбрасываем саму иконку списка - только цвета!
        // list.icon остается без изменений
        // Сбрасываем цвета всех ссылок в списке
        list.links.forEach(link => {
          link.customColor = undefined;
        });
      });
      saveListsToStorage(state);
    },
    resetAllCustomStyles(state) {
      state.forEach(list => {
        // Сбрасываем ВСЕ индивидуальные стили включая иконки
        list.customColor = undefined;
        list.customSeparatorColor = undefined;
        list.customLinkColor = undefined;
        list.iconColor = undefined;
        list.icon = undefined; // Сбрасываем и саму иконку
        // Сбрасываем цвета всех ссылок в списке
        list.links.forEach(link => {
          link.customColor = undefined;
        });
      });
      saveListsToStorage(state);
    },
    toggleListEnabled(state, action: PayloadAction<string>) {
      const list = state.find(l => l.id === action.payload);
      if (list) {
        list.enabled = list.enabled === false ? true : false;
        saveListsToStorage(state);
      }
    },
    applyListStates(state, action: PayloadAction<{ [listId: string]: boolean }>) {
      const listStates = action.payload;
      state.forEach(list => {
        if (listStates.hasOwnProperty(list.id)) {
          list.enabled = listStates[list.id];
        }
      });
      saveListsToStorage(state);
    },
    // Сброс к стандартным спискам (пустые)
    resetToStandardLists(state) {
      const newState = [...standardLists];
      saveListsToStorage(newState);
      return newState;
    },
  },
});

export const {
  addList,
  setLists,
  editListTitle,
  deleteList,
  setListColor,
  setListSeparatorColor,
  setListLinkColor,
  setListIcon,
  setListIconColor,
  addLinkToList,
  editLink,
  deleteLink,
  setLinkColor,
  reorderLinksInList,
  moveLinkToList,
  resetAllCustomColors,
  resetAllCustomStyles,
  toggleListEnabled,
  applyListStates,
  resetToStandardLists
} = listsSlice.actions;
export default listsSlice.reducer;
