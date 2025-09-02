import { env } from "@/env";
import { s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export default async function getS3Blob(key: string) {
  const bucketName = env.VITE_BUCKET_NAME;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error("No data returned from S3 for the provided key.");
  }

  return response.Body;
}
