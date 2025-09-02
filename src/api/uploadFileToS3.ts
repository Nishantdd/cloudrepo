import { env } from "@/env";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export default async function uploadFileToS3(
  path: string,
  file: File,
): Promise<string> {
  const bucketName = env.VITE_BUCKET_NAME;

  let key = "";
  if (file.webkitRelativePath) {
    key =
      path.length === 0
        ? file.webkitRelativePath
        : `${path}/${file.webkitRelativePath}`;
  } else {
    key = path.length === 0 ? file.name : `${path}/${file.name}`;
  }

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: new Uint8Array(await file.arrayBuffer()),
    ContentType: file.type || "application/octet-stream",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return key;
}
