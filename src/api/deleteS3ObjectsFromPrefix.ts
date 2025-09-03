import { env } from "@/env";
import { s3Client } from "@/lib/s3";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import type { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

/**
 * Deletes all S3 objects that match the given prefix, effectively removing a folder and its contents.
 * @param prefix - The prefix (folder path) for the objects to delete.
 */
export default async function deleteS3ObjectsWithAPrefix(
  prefix: string,
): Promise<void> {
  const bucketName = env.VITE_BUCKET_NAME;
  let continuationToken: string | undefined = undefined;

  do {
    // List objects with the given prefix
    const listResult: ListObjectsV2CommandOutput = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    const objects = listResult.Contents || [];

    if (objects.length > 0) {
      // Filter out objects without a Key and prepare for deletion
      const objectsToDelete = objects.reduce<{ Key: string }[]>((acc, obj) => {
        if (obj.Key) {
          acc.push({ Key: obj.Key });
        }
        return acc;
      }, []);

      if (objectsToDelete.length > 0) {
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: { Objects: objectsToDelete },
          }),
        );
      }
    }

    continuationToken = listResult.NextContinuationToken;
  } while (continuationToken);
}
