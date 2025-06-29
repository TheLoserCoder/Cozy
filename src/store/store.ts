import { configureStore } from "@reduxjs/toolkit";
import listsReducer from "./listsSlice";
import backgroundReducer from "./backgroundSlice";
import themeReducer from "./themeSlice";
import fastLinksReducer from "./fastLinksSlice";

export const store = configureStore({
  reducer: {
    lists: listsReducer,
    background: backgroundReducer,
    theme: themeReducer,
    fastLinks: fastLinksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
