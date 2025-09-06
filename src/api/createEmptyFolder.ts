import { env } from "@/env";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export default async function createEmptyFolder(
  path: string,
  folderName: string,
): Promise<void> {
  const bucketName = env.VITE_BUCKET_NAME;

  const folderKey = `${path ? `${path}/` : ""}${folderName.endsWith("/") ? `${folderName}` : `${folderName}/`}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: folderKey,
    Body: "",
  });

  await s3Client.send(command);
}
