// src/store/localStorageStore.ts
// Простое хранилище для работы с localStorage

export const localStorageStore = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value) as T;
      }
    } catch {}
    return defaultValue;
  },
  set<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};
