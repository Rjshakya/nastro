import { getDB } from "@/db";
import { sites } from "@/db/schema/site";
import { eq } from "drizzle-orm";
import { Data, Effect } from "effect";
import { nanoid } from "nanoid";
import { NotionWebsiteService } from "./notion/website";
import { getNotionRendererClient } from "@/lib/notion";
import { getAccessToken } from "@/lib/tokens";

type Site = typeof sites.$inferSelect;

const SITE_SHORT_ID_LENGTH = 10;

class SiteError extends Data.TaggedError("SiteError")<{
  message: string;
  code: "NOT_FOUND" | "ALREADY_EXISTS" | "INVALID_INPUT" | "UNKNOWN";
}> {}

interface SiteTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

interface SiteSEO {
  title?: string;
  description?: string;
  ogImage?: string;
}

interface SiteHeader {
  show: boolean;
  customNavLinks?: Array<{ label: string; url: string }>;
}

interface SiteFooter {
  show: boolean;
  content?: string;
}

export interface SiteSetting {
  theme?: SiteTheme;
  seo?: SiteSEO;
  header?: SiteHeader;
  footer?: SiteFooter;
}

interface CreateSiteInput {
  pageId: string;
  siteName: string;
  siteSetting?: SiteSetting;
}

interface UpdateSiteInput {
  siteName?: string;
  siteSetting?: SiteSetting;
}

type SiteSelect = Omit<Site, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

class SiteService {
  async createSite(
    userId: string,
    input: CreateSiteInput,
  ): Promise<SiteSelect> {
    const db = await getDB();

    const newSite: typeof sites.$inferInsert = {
      id: nanoid(),
      userId,
      pageId: input.pageId,
      shortId: nanoid(SITE_SHORT_ID_LENGTH),
      siteName: input.siteName,
      siteSetting: input.siteSetting ?? null,
    };

    const result = await db.insert(sites).values(newSite).returning();

    return this.transformSite(result[0]!);
  }

  async getSitesByUser(userId: string): Promise<SiteSelect[]> {
    const db = await getDB();

    const result = await db
      .select()
      .from(sites)
      .where(eq(sites.userId, userId));

    return result?.length > 0 ? result.map(this.transformSite) : [];
  }

  async getSiteById(siteId: string): Promise<SiteSelect | null> {
    const db = await getDB();

    const result = await db.select().from(sites).where(eq(sites.id, siteId));

    if (!result[0]) {
      return null;
    }

    return this.transformSite(result[0]!);
  }

  async getSiteByShortId(shortId: string): Promise<SiteSelect | null> {
    const db = await getDB();

    const result = await db
      .select()
      .from(sites)
      .where(eq(sites.shortId, shortId));

    if (!result[0]) {
      return null;
    }

    return this.transformSite(result[0]!);
  }

  async updateSite(
    siteId: string,
    input: UpdateSiteInput,
  ): Promise<SiteSelect> {
    const db = await getDB();

    const updateData: Partial<typeof sites.$inferInsert> = {};

    if (input.siteName !== undefined) {
      updateData.siteName = input.siteName;
    }

    if (input.siteSetting !== undefined) {
      updateData.siteSetting = input.siteSetting;
    }

    const result = await db
      .update(sites)
      .set(updateData)
      .where(eq(sites.id, siteId))
      .returning();

    if (!result[0]) {
      throw new SiteError({
        message: "Site not found",
        code: "NOT_FOUND",
      });
    }

    return this.transformSite(result[0]!);
  }

  async deleteSite(siteId: string): Promise<void> {
    const db = await getDB();

    await db.delete(sites).where(eq(sites.id, siteId));
  }

  private transformSite(site: Site): SiteSelect {
    return {
      id: site.id,
      userId: site.userId,
      pageId: site.pageId ?? null,
      databaseId: site.databaseId ?? null,
      shortId: site.shortId,
      siteName: site.siteName,
      siteSetting: site.siteSetting as SiteSetting | null,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    };
  }
}

const siteService = new SiteService();

export const createSite = (
  userId: string,
  input: CreateSiteInput,
): Effect.Effect<SiteSelect, SiteError, never> =>
  Effect.tryPromise({
    try: async () => {
      return await siteService.createSite(userId, input);
    },
    catch: (e): SiteError =>
      e instanceof SiteError
        ? e
        : new SiteError({
            message: e instanceof Error ? e.message : "Failed to create site",
            code: "UNKNOWN",
          }),
  });

export const getSitesByUser = (
  userId: string,
): Effect.Effect<SiteSelect[], SiteError, never> =>
  Effect.tryPromise({
    try: async () => {
      return await siteService.getSitesByUser(userId);
    },
    catch: (e): SiteError => {
      console.log(e);
      return new SiteError({
        message: e instanceof Error ? e.message : "Failed to get sites",
        code: "UNKNOWN",
      });
    },
  });

export const getSiteById = (siteId: string) =>
  Effect.tryPromise({
    try: async () => {
      console.log("siteId", siteId);
      const site = await siteService.getSiteById(siteId);

      console.log("site", site);

      if (!site?.pageId || !site?.userId) {
        throw new Error("No page id  for site");
      }

      const { accessToken, accountId } = await Effect.runPromise(
        getAccessToken(site.userId, "notion"),
      );

      console.log("accesstoken", accessToken);
      const notionApi = getNotionRendererClient(
        accessToken as string,
        accountId,
      );
      const websiteService = new NotionWebsiteService(notionApi);

      const cleanPageId = site.pageId.replace(/-/g, "");
      const page = await Effect.runPromise(websiteService.getPage(cleanPageId));
      console.log("page", page);
      return page;
    },
    catch: (e): SiteError => {
      console.log(e);
      return e instanceof SiteError
        ? e
        : new SiteError({
            message: e instanceof Error ? e.message : "Failed to get site",
            code: "UNKNOWN",
          });
    },
  });

export const getSiteByShortId = (
  shortId: string,
): Effect.Effect<SiteSelect, SiteError, never> =>
  Effect.tryPromise({
    try: async () => {
      const site = await siteService.getSiteByShortId(shortId);
      if (!site) {
        throw new SiteError({
          message: "Site not found",
          code: "NOT_FOUND",
        });
      }
      return site;
    },
    catch: (e): SiteError =>
      e instanceof SiteError
        ? e
        : new SiteError({
            message: e instanceof Error ? e.message : "Failed to get site",
            code: "UNKNOWN",
          }),
  });

export const updateSite = (
  siteId: string,
  input: UpdateSiteInput,
): Effect.Effect<SiteSelect, SiteError, never> =>
  Effect.tryPromise({
    try: async () => {
      return await siteService.updateSite(siteId, input);
    },
    catch: (e): SiteError =>
      e instanceof SiteError
        ? e
        : new SiteError({
            message: e instanceof Error ? e.message : "Failed to update site",
            code: "UNKNOWN",
          }),
  });

export const deleteSite = (
  siteId: string,
): Effect.Effect<void, SiteError, never> =>
  Effect.tryPromise({
    try: async () => {
      await siteService.deleteSite(siteId);
    },
    catch: (e): SiteError =>
      new SiteError({
        message: e instanceof Error ? e.message : "Failed to delete site",
        code: "UNKNOWN",
      }),
  });
