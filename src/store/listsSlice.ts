import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LinkList, LinkListItem } from "../entities/list/list.types";
import { getListsFromStorage, saveListsToStorage } from "../entities/list/list.storage";

const initialState: LinkList[] = getListsFromStorage();

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
  },
});

export const { addList, setLists, editListTitle, deleteList, addLinkToList, reorderLinksInList, moveLinkToList } = listsSlice.actions;
export default listsSlice.reducer;
