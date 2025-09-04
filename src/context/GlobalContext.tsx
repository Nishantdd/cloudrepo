import { env } from "@/env.ts";
import type { StorageClass } from "@/types/s3";
import type { ReactNode } from "react";
import { createContext, useState } from "react";

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
  const [storageClass, setStorageClass] = useState<StorageClass>("STANDARD");
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
