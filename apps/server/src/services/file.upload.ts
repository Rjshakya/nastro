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

export class S3clientService extends ServiceMap.Service<
  S3clientService,
  {
    client: S3Client;
    bucket: BucketNames;
  }
>()("/file.upload.ts/S3clientService") {}

export const SiteAssetsBucketLive = Layer.succeed(S3clientService)({
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

export const TemplateAssetsBucketLive = Layer.succeed(S3clientService)({
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
    }) => Effect.Effect<
      { uploadUrl: string; fileUrl: string },
      FileUploadServiceError,
      never
    >;
  }
>()("/file.upload.ts/FileUploadService") {}

export const FileUploadServiceLive = Layer.effect(FileUploadService)(
  Effect.gen(function* () {
    const storage = yield* S3clientService;

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

            return { uploadUrl, fileUrl: "string" };
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
