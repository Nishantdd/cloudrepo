import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";

const bucketRegion = env.VITE_BUCKET_REGION;

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: env.VITE_ACCESS_KEY,
    secretAccessKey: env.VITE_SECRET_ACCESS_KEY,
  },
});

export { s3Client };
