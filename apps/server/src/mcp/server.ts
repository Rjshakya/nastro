import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, Layer } from "effect";
import z from "zod";
import {
  FileUploadService,
  FileUploadServiceLive,
  SiteAssetsBucketLive,
} from "@/services/file.upload";
import { SiteRepo } from "@/repo/site";
import { DatabaseLive } from "@/db";
import { SiteError } from "@/errors/tagged.errors";

function extractSlugFromUrl(urlString: string): string | null {
  const urlObj = new URL(urlString);
  const hostname = urlObj.hostname;

  if (hostname === "localhost") {
    const slugFromQuery = urlObj.searchParams.get("slug");
    return slugFromQuery;
  }

  const slug = hostname.split(".")[0];
  return slug || null;
}

function createMcpServer({
  userId,
  permission,
}: {
  userId: string | null;
  permission: string | null;
}) {
  const mcpServer = new McpServer({
    name: "nastro-mcp-server",
    version: "1.0.0",
  });

  mcpServer.registerTool(
    "getUrlToSaveCss",

    {
      description:
        "Use this tool to get a presigned URL to upload a custom CSS file for a site. Provide the full site URL (e.g., https://slug.nastro.site/pageId). The tool will return a presigned upload URL along with the final file URL.",
      inputSchema: {
        siteUrl: z.url(),
      },
    },
    async ({ siteUrl }) => {
      try {
        const slug = extractSlugFromUrl(siteUrl);

        if (!slug) {
          return {
            content: [
              {
                type: "text",
                text: "failed to extract slug from the provided URL",
              },
            ],
            isError: true,
          };
        }

        const fileName = `custom-${Date.now()}.css`;

        const programLayer = Layer.mergeAll(
          FileUploadServiceLive.pipe(
            Layer.provideMerge(Layer.mergeAll(SiteAssetsBucketLive)),
          ),
        );

        const program = Effect.gen(function* () {
          const fileService = yield* FileUploadService;
          return yield* fileService.getPresignedUrl({
            fileName: `${slug}/${fileName}`,
            expiresIn: 600,
          });
        }).pipe(Effect.provide(programLayer));

        const { uploadUrl, fileUrl } = await Effect.runPromise(program);

        return {
          content: [
            {
              type: "text",
              text: `Presigned URL generated successfully.\n\nUpload URL (use PUT to upload the CSS file): ${uploadUrl}\n\nFile URL (will be available after upload): ${fileUrl}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `failed to generate presigned URL: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  mcpServer.registerTool(
    "saveCss",
    {
      description:
        "Save a custom CSS file URL for nastro's site. The CSS URL must match the generated presigned upload URL format.",
      inputSchema: {
        siteUrl: z.url(),
        cssUrl: z
          .string()
          .regex(
            /^https:\/\/sites-assets\.nastro\.xyz\/nastro-sites-assets\/[a-z0-9-]+\/custom-\d+\.css$/,
            "Invalid CSS URL format. Expected: https://sites-assets.nastro.xyz/nastro-sites-assets/{slug}/custom-{timestamp}.css",
          ),
      },
    },
    async ({ siteUrl, cssUrl }) => {
      try {
        const slug = extractSlugFromUrl(siteUrl);

        if (!slug) {
          return {
            content: [
              {
                type: "text",
                text: "failed to extract slug from the provided site URL",
              },
            ],
            isError: true,
          };
        }

        const cssUrlObj = new URL(cssUrl);
        const pathParts = cssUrlObj.pathname.split("/");
        const cssSlug = pathParts[2];

        if (cssSlug !== slug) {
          return {
            content: [
              {
                type: "text",
                text: "CSS URL slug does not match the site slug",
              },
            ],
            isError: true,
          };
        }

        const program = Effect.gen(function* () {
          const repo = yield* SiteRepo;
          const sites = yield* repo.findById("slug", slug);
          if (sites.length === 0) {
            return yield* new SiteError({
              type: "NOT_FOUND",
              message: "site not found",
              code: 404,
            });
          }
          const site = sites[0];
          return yield* repo.updateById("id", site.id, {
            customCssLink: cssUrl,
          });
        }).pipe(Effect.provide(DatabaseLive()));

        await Effect.runPromise(program);

        return {
          content: [
            {
              type: "text",
              text: siteUrl,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `failed to save CSS URL: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return mcpServer;
}

export { createMcpServer };
