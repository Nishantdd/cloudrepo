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
