import type { ObjectItem } from "@/types/s3";

const root: ObjectItem[] = [
  {
    name: "data",
    type: "folder",
    lastModified: "2025-08-29T14:22:00Z",
    timestamp: "2025-08-28T14:22:00Z",
    class: "dir",
  },
  {
    name: "readme.txt",
    type: "file",
    lastModified: "2025-08-28T12:00:00Z",
    timestamp: "2025-08-28T14:22:00Z",
    class: "txt",
    size: "1.96 KB",
  },
  {
    name: "image.jpeg",
    type: "file",
    lastModified: "2025-08-28T12:00:00Z",
    timestamp: "2025-08-28T14:22:00Z",
    class: "jpeg",
    size: "2.31 MB",
  },
];

const data: ObjectItem[] = [
  {
    name: "images",
    type: "folder",
    lastModified: "2025-08-28T15:00:00Z",
    timestamp: "2025-08-28T14:22:00Z",
    class: "dir",
  },
  {
    name: "notes.md",
    type: "file",
    lastModified: "2025-08-26T09:30:00Z",
    timestamp: "2025-08-28T14:22:00Z",
    class: "md",
    size: "5 KB",
  },
];

const images: ObjectItem[] = [
  {
    name: "photo1.png",
    type: "file",
    lastModified: "2025-08-27T08:10:00Z",
    timestamp: "2025-08-28T14:22:00Z",
    class: "png",
    size: "1.4 MB",
  },
];

export default { root, data, images };
