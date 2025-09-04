import { env } from "@/env.ts";
import { type StorageClass, storageClasses } from "@/types/s3";
import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";

type themeType = "dark" | "light";

export const GlobalContext = createContext<{
  themeMode: themeType;
  setThemeMode: React.Dispatch<React.SetStateAction<themeType>>;
  bucketName: string;
  storageClass: StorageClass;
  setStorageClass: React.Dispatch<React.SetStateAction<StorageClass>>;
}>({
  themeMode: "light",
  setThemeMode: () => {},
  bucketName: env.VITE_BUCKET_NAME,
  storageClass: "STANDARD",
  setStorageClass: () => {},
});

type ProviderProps = {
  children: ReactNode;
};

export const GlobalContextProvider = ({ children }: ProviderProps) => {
  const [themeMode, setThemeMode] = useState<themeType>(() =>
    localStorage.getItem("themeMode") === "dark" ? "dark" : "light",
  );

  const [storageClass, setStorageClass] = useState<StorageClass>(() => {
    const storageClass = localStorage.getItem("storageClass") || "STANDARD";
    return storageClasses.find((sc) => sc === storageClass) || "STANDARD";
  });

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(themeMode);
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("storageClass", storageClass);
  }, [storageClass]);

  return (
    <GlobalContext.Provider
      value={{
        themeMode: themeMode,
        setThemeMode: setThemeMode,
        bucketName: env.VITE_BUCKET_NAME,
        storageClass: storageClass,
        setStorageClass: setStorageClass,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
