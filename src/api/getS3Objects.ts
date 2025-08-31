import { env } from "@/env";
import type { ExplorerItem, ObjectItem } from "@/types/s3";
import {
  ListObjectsV2Command,
  S3Client,
  type _Object,
} from "@aws-sdk/client-s3";

const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const toISO = (d: Date | undefined) => {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString();
  try {
    return new Date(d).toISOString();
  } catch {
    return String(d);
  }
};

export default async function getS3Objects(
  path: string,
): Promise<ExplorerItem[]> {
  const bucketName = env.VITE_BUCKET_NAME;
  const bucketRegion = env.VITE_BUCKET_REGION;

  if (!bucketName) {
    throw new Error("BUCKET_NAME environment variable not defined.");
  }

  const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
      accessKeyId: env.VITE_ACCESS_KEY,
      secretAccessKey: env.VITE_SECRET_ACCESS_KEY,
    },
  });

  return s3
    .send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: path,
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
            const folderPath = `/${folderSegments.join("/")}`; // folder path
            ensurePath(folderPath);

            const parentPath =
              i === 0 ? "" : `/${folderSegments.slice(0, i).join("/")}`;
            ensurePath(parentPath);

            const folderName = folderSegments[folderSegments.length - 1];
            const folderEntry: ObjectItem = {
              name: folderName,
              type: "folder",
              lastModified: "",
              timestamp: "",
              class: "dir",
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
              const folderPath = `/${folderSegments.join("/")}`;
              ensurePath(folderPath);

              const parentPath =
                i === 0 ? "" : `/${folderSegments.slice(0, i).join("/")}`;
              ensurePath(parentPath);

              const folderName = folderSegments[folderSegments.length - 1];
              const folderEntry: ObjectItem = {
                name: folderName,
                type: "folder",
                lastModified: "",
                timestamp: "",
                class: "dir",
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
              ? `/${segments.slice(0, segments.length - 1).join("/")}`
              : "";
          ensurePath(parentPath);

          const name = segments[segments.length - 1];
          const extMatch = name.match(/\.([^.]+)$/);
          const ext = extMatch ? extMatch[1].toLowerCase() : "file";

          const fileEntry: ObjectItem = {
            name,
            type: "file",
            lastModified: toISO(item.LastModified),
            timestamp: toISO(item.LastModified),
            class: ext,
            size:
              typeof item.Size === "number"
                ? formatBytes(item.Size)
                : undefined,
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
