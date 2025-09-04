import { env } from "@/env.ts";
import { type StorageClass, storageClasses } from "@/types/s3";
import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext<{
  bucketName: string;
  storageClass: StorageClass;
  setStorageClass: React.Dispatch<React.SetStateAction<StorageClass>>;
}>({
  bucketName: env.VITE_BUCKET_NAME,
  storageClass: "STANDARD",
  setStorageClass: () => {},
});

type ProviderProps = {
  children: ReactNode;
};

export const GlobalContextProvider = ({ children }: ProviderProps) => {
  const [storageClass, setStorageClass] = useState<StorageClass>(() => {
    const storageClass = localStorage.getItem("storageClass") || "STANDARD";
    return storageClasses.find((sc) => sc === storageClass) || "STANDARD";
  });

  useEffect(() => {
    localStorage.setItem("storageClass", storageClass);
  }, [storageClass]);

  return (
    <GlobalContext.Provider
      value={{
        bucketName: env.VITE_BUCKET_NAME,
        storageClass: storageClass,
        setStorageClass: setStorageClass,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
