import { env } from "@/env";
import { s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export default async function getS3Blob(key: string): Promise<Blob> {
  const bucketName = env.VITE_BUCKET_NAME;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error("No data returned from S3 for the provided key.");
  }

  // biome-ignore lint/suspicious/noExplicitAny: I expect it to work
  return await new Response(response.Body as any).blob();
}
