"use client";
import { createContext, useContext, useRef } from "react";
import { StoreApi, useStore } from "zustand";
import { AppStore, createAppStore } from "./stores/app.store";
import { defaultNodes } from "@/nodes/defaultNodes";

const AppStoreContext = createContext<StoreApi<AppStore> | undefined>(undefined);

export const AppStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<StoreApi<AppStore>>(undefined);

  if (!storeRef.current) {
    const store = createAppStore();

    store.getState().actions.defineMeta(defaultNodes);

    storeRef.current = store;
  }

  return <AppStoreContext.Provider value={storeRef.current}>{children}</AppStoreContext.Provider>;
};

export const useAppStore = <T,>(selector: (state: AppStore) => T) => {
  const appStore = useContext(AppStoreContext);

  if (!appStore) throw new Error("App store is not created");

  return useStore(appStore, selector);
};

export default AppStoreContext;
