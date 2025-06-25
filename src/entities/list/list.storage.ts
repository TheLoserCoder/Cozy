import { LinkList } from "./list.types";
import { localStorageStore } from "../../store/localStorageStore";

const STORAGE_KEY = "lists";

export function getListsFromStorage(): LinkList[] {
  return localStorageStore.get<LinkList[]>(STORAGE_KEY, []);
}

export function saveListsToStorage(lists: LinkList[]) {
  localStorageStore.set(STORAGE_KEY, lists);
}
