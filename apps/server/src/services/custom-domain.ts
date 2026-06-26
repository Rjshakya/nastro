import { env } from "cloudflare:workers";
import { Effect, Layer, ServiceMap } from "effect";
import { CustomDomainRepo } from "@/repo/custom-domain";
import { customDomainTableSelect } from "@/db/schema/custom-domain";
import {
  BillingError,
  CustomDomainError,
  RepoError,
} from "@/errors/tagged.errors";
import type {
  HostnameStatus,
  CfApiResponse,
  CustomHostnameResult,
} from "@/types/cloudflare";
import { eq } from "drizzle-orm";
import { sites } from "@/db/schema/site";
import { getSiteBySlugWithPage } from "./site";
import { BillingService } from "@/services/billing";

// ─── Constants ──────────────────────────────────────────────────────────────

export const DomainCNAME = "customers.nastro.xyz";

// ─── Low-level CF API helpers ───────────────────────────────────────────────

const createCustomHostname = ({
  hostName,
  zoneId,
  apiToken,
}: {
  hostName: string;
  zoneId: string;
  apiToken: string;
}) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostname: hostName,
            ssl: {
              method: "http",
              type: "dv",
            },
          }),
        },
      );
      const data =
        (await response.json()) as CfApiResponse<CustomHostnameResult>;

      if (!data.success) {
        throw {
          message: data.errors?.[0]?.message ?? "Cloudflare API error",
          status: data.errors?.[0]?.code ?? response.status,
        };
      }

      return data.result;
    },
    catch: (error: any) =>
      new CustomDomainError({
        message: error?.message ?? JSON.stringify(error),
        type: "CF_ERROR",
        code: error?.status ?? 500,
      }),
  });

const deleteCustomHostname = ({
  cfId,
  zoneId,
  apiToken,
}: {
  cfId: string;
  zoneId: string;
  apiToken: string;
}) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${cfId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = (await response.json()) as CfApiResponse<{ id: string }>;

      if (!data.success) {
        throw {
          message: data.errors?.[0]?.message ?? "Cloudflare API error",
          status: data.errors?.[0]?.code ?? response.status,
        };
      }

      return data.result;
    },
    catch: (error: any) =>
      new CustomDomainError({
        message: error?.message ?? JSON.stringify(error),
        type: "CF_ERROR",
        code: error?.status ?? 500,
      }),
  });

const getCustomHostname = ({
  cfId,
  zoneId,
  apiToken,
}: {
  cfId: string;
  zoneId: string;
  apiToken: string;
}) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${cfId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data =
        (await response.json()) as CfApiResponse<CustomHostnameResult>;

      if (!data.success) {
        throw {
          message: data.errors?.[0]?.message ?? "Cloudflare API error",
          status: data.errors?.[0]?.code ?? response.status,
        };
      }

      return data.result;
    },
    catch: (error: any) =>
      new CustomDomainError({
        message: error?.message ?? JSON.stringify(error),
        type: "CF_ERROR",
        code: error?.status ?? 500,
      }),
  });

// ─── Service Interface ──────────────────────────────────────────────────────

export interface CreateCustomDomainInput {
  userId: string;
  siteId: string;
  hostName: string;
}

export interface DomainStatus {
  id: string;
  hostName: string;
  status?: HostnameStatus;
  sslStatus?: string;
}

export interface UpdateCustomDomainInput {
  id: string;
  siteId: string;
  userId: string;
  hostName: string;
  status: string;
}

const ClouflareConfigMake = {
  zoneId: () => Effect.succeed(env.CLOUDFLARE_ZONE_ID),
  apiKey: () => Effect.succeed(env.CLOUDFLARE_NASTRO_ZONE_API_KEY),
};

export class CloudflareConfig extends ServiceMap.Service<
  CloudflareConfig,
  typeof ClouflareConfigMake
>()("server/services/custom-domain/CloudflareConfig") {}

// ─── Service Implementation ───────────────────────────────────────────────────

const CustomDomainServiceMake = Effect.gen(function* () {
  const repo = yield* CustomDomainRepo;
  const config = yield* CloudflareConfig;
  const zoneId = yield* config.zoneId();
  const apiToken = yield* config.apiKey();

  const createCustomDomain = (input: CreateCustomDomainInput) => {
    return Effect.gen(function* () {
      const billingService = yield* BillingService;

      const existingDomains = yield* repo.findById("userId", input.userId);
      const canAdd = yield* billingService.canAddCustomDomain(
        input.userId,
        existingDomains.length,
      );

      if (!canAdd) {
        return yield* new BillingError({
          message: "This feature require Pro plan",
          type: "PRO_FEATURE_REQUIRED",
          code: 403,
        });
      }

      // 1. Create the hostname in Cloudflare
      const hostnameResult = yield* createCustomHostname({
        hostName: input.hostName,
        zoneId,
        apiToken,
      });

      const { id: cfId, hostname, status } = hostnameResult;

      // 2. Insert into DB — rollback CF hostname on failure
      const insertResult = yield* repo
        .insert({
          userId: input.userId,
          siteId: input.siteId,
          hostName: hostname,
          status: status ?? "pending",
          cfId,
        })
        .pipe(
          Effect.catch((dbError: RepoError) =>
            Effect.gen(function* () {
              // Rollback: delete the CF hostname so we don't leave orphans
              yield* deleteCustomHostname({ cfId, zoneId, apiToken });
              return yield* new CustomDomainError({
                message: `Failed to save domain record: ${dbError.message}`,
                type: "CF_ERROR",
                code: 500,
              });
            }),
          ),
        );

      return insertResult[0];
    });
  };

  const deleteCustomDomain = (params: {
    id: string;
  }): Effect.Effect<
    customDomainTableSelect,
    CustomDomainError | RepoError,
    never
  > => {
    return Effect.gen(function* () {
      const domainRecords = yield* repo.findById("id", params.id);

      if (!domainRecords || domainRecords.length === 0) {
        return yield* new CustomDomainError({
          message: "Domain not found",
          type: "NOT_FOUND",
          code: 404,
        });
      }

      const domain = domainRecords[0];

      if (!domain.cfId) {
        return yield* new CustomDomainError({
          message: `NO Cf ID found for ${domain}`,
          type: "MISSING_CF_ID",
        });
      }

      // Delete CF hostname if present
      yield* deleteCustomHostname({
        cfId: domain.cfId,
        zoneId,
        apiToken,
      });

      // Delete from DB
      const deleted = yield* repo.deleteById("id", params.id);
      return deleted[0];
    });
  };

  const getDomainStatus = (params: {
    id: string;
  }): Effect.Effect<DomainStatus, CustomDomainError | RepoError, never> => {
    return Effect.gen(function* () {
      const domainRecords = yield* repo.findById("id", params.id);

      if (!domainRecords || domainRecords.length === 0) {
        return yield* new CustomDomainError({
          message: "Domain not found",
          type: "NOT_FOUND",
          code: 404,
        });
      }

      const domain = domainRecords[0];

      if (!domain.cfId) {
        return yield* new CustomDomainError({
          message: "Domain has no Cloudflare ID associated",
          type: "MISSING_CF_ID",
          code: 400,
        });
      }

      const hostNameResult = yield* getCustomHostname({
        cfId: domain.cfId,
        zoneId,
        apiToken,
      }).pipe(
        Effect.catch((error: CustomDomainError) => {
          const msg = error.message?.toLowerCase() ?? "";
          if (msg.includes("the custom hostname was not found")) {
            return Effect.gen(function* () {
              yield* repo.deleteById("id", params.id);
              return yield* new CustomDomainError({
                message:
                  "Custom hostname was not found in Cloudflare; local record cleaned up",
                type: "NOT_FOUND",
                code: 404,
              });
            });
          }
          return Effect.fail(error);
        }),
      );

      return {
        id: domain.id,
        hostName: domain.hostName,
        status: hostNameResult.status,
        sslStatus: hostNameResult.ssl?.status,
      };
    });
  };

  const updateCustomDomain = (
    input: UpdateCustomDomainInput,
  ): Effect.Effect<
    customDomainTableSelect[],
    CustomDomainError | RepoError,
    never
  > => {
    return Effect.gen(function* () {
      const result = yield* repo.updateById("id", input.id, {
        siteId: input.siteId,
        userId: input.userId,
        hostName: input.hostName,
        status: input.status,
      });
      return result;
    });
  };

  const getDomainCname = () => DomainCNAME;

  const getSiteByCustomDomain = (input: {
    hostname: string;
    pageId?: string;
  }) => {
    return Effect.gen(function* () {
      const siteRecord = yield* repo.execute((db, table) =>
        Effect.tryPromise({
          try: async () => {
            const [domainSiteMappingRecord] = await db
              .select({ siteId: table.siteId })
              .from(table)
              .where(eq(table.hostName, input.hostname));

            if (!domainSiteMappingRecord?.siteId) {
              throw {
                message:
                  "No domain site mapping found for this hostname" +
                  input.hostname,
              };
            }

            const { siteId } = domainSiteMappingRecord;
            const [siteRecord] = await db
              .select({ slug: sites.slug, rootPageId: sites.rootPageId })
              .from(sites)
              .where(eq(sites.id, siteId));

            if (!siteRecord?.slug || !siteRecord?.rootPageId) {
              throw {
                message: "No site found for this hostname" + input.hostname,
              };
            }

            return siteRecord;
          },
          catch: (e) => {
            console.error(e);
            return new RepoError({
              message: e as any,
              type: "FAILED_TO_EXECUTE",
            });
          },
        }),
      );

      const siteAndPage = yield* getSiteBySlugWithPage(
        siteRecord.slug,
        input?.pageId ?? siteRecord.rootPageId,
      );

      return siteAndPage;
    });
  };

  return {
    createCustomDomain,
    deleteCustomDomain,
    getDomainStatus,
    updateCustomDomain,
    getDomainCname,
    getSiteByCustomDomain,
  };
});

// ─── Service Tag (inferred from make) ───────────────────────────────────────

export class CustomDomainService extends ServiceMap.Service<CustomDomainService>()(
  "services/custom-domain",
  {
    make: CustomDomainServiceMake,
  },
) {}

// ─── Live Layer ─────────────────────────────────────────────────────────────

export const ClouflareConfigLive =
  Layer.succeed(CloudflareConfig)(ClouflareConfigMake);

export const CustomDomainServiceLive = Layer.effect(
  CustomDomainService,
  CustomDomainService.make,
);
