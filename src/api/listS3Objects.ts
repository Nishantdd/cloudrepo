import { env } from "@/env";
import { formatDate, toISO } from "@/lib/helpers";
import { s3Client } from "@/lib/s3";
import type { ExplorerItem, ObjectItem } from "@/types/s3";
import {
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";

export default async function listExplorerItemsFromS3(): Promise<
  ExplorerItem[]
> {
  const bucketName = env.VITE_BUCKET_NAME;

  return s3Client
    .send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      }),
    )
    .then((response) => {
      const contents = response.Contents ?? [];

      const map = new Map<
        string,
        { objects: ObjectItem[]; _namesSet: Set<string> }
      >();

      const ensurePath = (p: string) => {
        if (!map.has(p)) map.set(p, { objects: [], _namesSet: new Set() });
      };

      // always ensure root exists
      ensurePath("");

      for (const item of contents) {
        const rawKey: string = item.Key ?? "";
        if (!rawKey) continue;

        const isFolder = rawKey.endsWith("/");
        const segments = rawKey.split("/").filter(Boolean); // removes empty segments

        if (segments.length === 0) continue;

        if (isFolder) {
          // For folder keys (ending with /) — create folder entries for each prefix
          for (let i = 0; i < segments.length; i++) {
            const folderSegments = segments.slice(0, i + 1);
            const folderPath = folderSegments.join("/"); // folder path
            ensurePath(folderPath);

            const parentPath =
              i === 0 ? "" : folderSegments.slice(0, i).join("/");
            ensurePath(parentPath);

            const folderName = folderSegments[folderSegments.length - 1];
            const folderEntry: ObjectItem = {
              name: folderName,
              type: "folder",
              lastModified: "",
              timestamp: "",
              class: "",
            };

            const parentBucket = map.get(parentPath);
            if (!parentBucket)
              throw new Error(`Bucket not found for parentPath: ${parentPath}`);
            if (!parentBucket._namesSet.has(folderName)) {
              parentBucket.objects.push(folderEntry);
              parentBucket._namesSet.add(folderName);
            }
          }
        } else {
          // For file/object keys — ensure intermediate folder paths, then add file to immediate parent
          if (segments.length > 1) {
            for (let i = 0; i < segments.length - 1; i++) {
              const folderSegments = segments.slice(0, i + 1);
              // Changed: remove leading slash from folderPath
              const folderPath = folderSegments.join("/");
              ensurePath(folderPath);

              const parentPath =
                i === 0 ? "" : folderSegments.slice(0, i).join("/");
              ensurePath(parentPath);

              const folderName = folderSegments[folderSegments.length - 1];
              const folderEntry: ObjectItem = {
                name: folderName,
                type: "folder",
                lastModified: "",
                timestamp: "",
                class: "",
              };

              const parentBucket = map.get(parentPath);
              if (!parentBucket)
                throw new Error(
                  `Bucket not found for parentPath: ${parentPath}`,
                );
              if (!parentBucket._namesSet.has(folderName)) {
                parentBucket.objects.push(folderEntry);
                parentBucket._namesSet.add(folderName);
              }
            }
          }

          // Add file into immediate parent
          const parentPath =
            segments.length > 1
              ? segments.slice(0, segments.length - 1).join("/")
              : "";
          ensurePath(parentPath);

          const name = segments[segments.length - 1];

          const fileEntry: ObjectItem = {
            name,
            type: "file",
            lastModified: formatDate(item.LastModified),
            timestamp: toISO(item.LastModified),
            class: item?.StorageClass || "Unknown",
            size: item.Size,
          };

          const parentBucket = map.get(parentPath);
          if (!parentBucket)
            throw new Error(`Bucket not found for parentPath: ${parentPath}`);

          if (!parentBucket._namesSet.has(name)) {
            parentBucket.objects.push(fileEntry);
            parentBucket._namesSet.add(name);
          }
        }
      }

      // Convert to ExplorerItem[] and sort contents (folders first, then files) and sort paths
      const result: ExplorerItem[] = Array.from(map.entries()).map(
        ([p, { objects }]) => {
          objects.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === "folder" ? -1 : 1;
          });
          return { path: p, objects };
        },
      );

      result.sort((a, b) => {
        const da = a.path === "" ? 0 : a.path.split("/").length;
        const db = b.path === "" ? 0 : b.path.split("/").length;
        if (da !== db) return da - db;
        return a.path.localeCompare(b.path);
      });

      return result;
    });
}
