/**
 *
 *  getPresignedUrl(fileMetadata):{uploadUrl:string , fileUrl:string}
 *
 */

import { Effect, Layer, ServiceMap } from "effect";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { FileUploadServiceError } from "@/errors/tagged.errors";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "cloudflare:workers";

type BucketNames = "nastro-sites-assets" | "nastro-templates-assets";

export class S3Service extends ServiceMap.Service<
  S3Service,
  {
    client: S3Client;
    bucket: BucketNames;
  }
>()("/file.upload.ts/S3Service") {}

export const SiteAssetsBucketLive = Layer.succeed(S3Service)({
  bucket: "nastro-sites-assets",
  client: new S3Client({
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    region: "auto",
    endpoint: env.SITE_ASSETS_BUCKET_ENDPOINT,
  }),
});

export const TemplateAssetsBucketLive = Layer.succeed(S3Service)({
  bucket: "nastro-templates-assets",
  client: new S3Client({
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    region: "auto",
    endpoint: env.TEMPLATE_ASSETS_BUCKET_ENDPOINT,
  }),
});

export class FileUploadService extends ServiceMap.Service<
  FileUploadService,
  {
    getPresignedUrl: (fileMetadata: {
      fileName: string;
      expiresIn: number;
    }) => Effect.Effect<{ uploadUrl: string; fileUrl: string }, FileUploadServiceError, never>;
  }
>()("/file.upload.ts/FileUploadService") {}

export const FileUploadServiceLive = Layer.effect(FileUploadService)(
  Effect.gen(function* () {
    const storage = yield* S3Service;

    return {
      getPresignedUrl({ fileName, expiresIn }) {
        return Effect.tryPromise({
          try: async () => {
            const key = fileName;
            const command = new PutObjectCommand({
              Bucket: storage.bucket,
              Key: key,
            });

            const uploadUrl = await getSignedUrl(storage.client, command, {
              expiresIn,
            });

            let buckerUrl = env.SITE_ASSETS_BUCKET_PROD_URL;

            if (storage.bucket === "nastro-templates-assets") {
              buckerUrl = env.TEMPLATE_ASSETS_BUCKET_PROD_URL;
            }

            const fileUrl = new URL(`/${storage.bucket}/${key}`, buckerUrl).href;

            return { uploadUrl, fileUrl };
          },
          catch: (e) => {
            console.error(e);
            return new FileUploadServiceError({
              message: "failed to generate presigned url",
              type: "PRESIGNED_URL_GENERATION_FAILED",
              code: 500,
            });
          },
        });
      },
    };
  }),
);
