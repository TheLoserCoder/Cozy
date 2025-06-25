import { configureStore } from "@reduxjs/toolkit";

// Здесь будут добавляться редьюсеры
export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
