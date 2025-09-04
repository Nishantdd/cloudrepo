export type ObjectItem = {
  name: string;
  type: string;
  lastModified: string;
  timestamp: string;
  class: string;
  size?: number;
};

export type ExplorerItem = {
  path: string;
  objects: ObjectItem[];
};

export const storageClasses = [
  "STANDARD",
  "STANDARD_IA",
  "INTELLIGENT_TIERING",
  "ONEZONE_IA",
  "EXPRESS_ONEZONE",
  "GLACIER_IR",
  "GLACIER",
  "DEEP_ARCHIVE",
] as const;

export type StorageClass = (typeof storageClasses)[number];
