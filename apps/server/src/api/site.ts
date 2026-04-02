import { DatabaseLive } from "@/db";
import { sitesInsertSchema } from "@/db/schema/site";
import { ApiResponse } from "@/lib/api";
import { KeyManager } from "@/lib/cache";
import { Vars } from "@/lib/hono-types";
import { NotionClientLive } from "@/lib/notion";
import { authMiddleWare } from "@/middlewares/auth";
import { SiteRepo } from "@/repo/site";
import { KVStoreLive } from "@/services/kv-store";
import { NotionServiceLive } from "@/services/notion/main";
import {
  createSite,
  getSiteBySlugWithPage,
  isSlugAvailable,
} from "@/services/site";
import { SlugService, SlugServiceLive } from "@/services/slug";

import { zValidator } from "@hono/zod-validator";
import { Effect, pipe } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";

const siteParamsSchema = z.object({
  id: z.string().min(1, "Site ID is required"),
});

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const BANNED_SUBDOMAINS = new Set([
  // ── Product & brand ──────────────────────────────────────
  "nastro",
  "nastro-app",
  "getnastro",
  "trynastro",

  // ── Core pages / marketing ───────────────────────────────
  "www",
  "app",
  "home",
  "landing",
  "site",
  "web",

  // ── Auth ─────────────────────────────────────────────────
  "auth",
  "login",
  "logout",
  "signin",
  "signup",
  "register",
  "sso",
  "oauth",
  "callback",
  "verify",
  "confirm",
  "reset",
  "forgot",
  "password",
  "2fa",
  "mfa",

  // ── Product sections ─────────────────────────────────────
  "dashboard",
  "admin",
  "console",
  "panel",
  "settings",
  "account",
  "profile",
  "billing",
  "checkout",
  "upgrade",
  "plans",
  "pricing",
  "onboarding",

  // ── Docs / legal / support ───────────────────────────────
  "docs",
  "documentation",
  "help",
  "support",
  "faq",
  "status",
  "roadmap",
  "changelog",
  "blog",
  "news",
  "press",
  "terms",
  "privacy",
  "legal",
  "security",
  "abuse",
  "dmca",

  // ── Infrastructure ───────────────────────────────────────
  "api",
  "cdn",
  "assets",
  "static",
  "media",
  "uploads",
  "files",
  "storage",
  "mail",
  "email",
  "smtp",
  "imap",
  "ns",
  "ns1",
  "ns2",
  "dns",
  "ftp",
  "sftp",
  "ssh",
  "vpn",
  "proxy",
  "gateway",

  // ── Internal / system ────────────────────────────────────
  "internal",
  "intranet",
  "dev",
  "develop",
  "development",
  "staging",
  "stage",
  "test",
  "testing",
  "sandbox",
  "preview",
  "beta",
  "alpha",
  "canary",
  "local",
  "localhost",

  // ── Common squatting targets ─────────────────────────────
  "about",
  "contact",
  "careers",
  "jobs",
  "team",
  "investors",
  "partners",
  "affiliate",
  "store",
  "shop",
  "pay",
  "payments",
]);

const SlugSchema = z
  .string()
  .min(3, "minimum one char is required")
  .max(32)
  .regex(SLUG_REGEX)
  .refine((s) => !BANNED_SUBDOMAINS.has(s));

const getSiteQuerySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  pageId: z.string().min(1, "Page ID is required"),
  fresh: z
    .preprocess((v) => {
      if (v === "true") return true;
      return false;
    }, z.boolean())
    .optional(),
});

const sitesApp = new Hono<{ Variables: Vars }>()
  .get(
    "/",
    rateLimiter({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        return c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    zValidator("query", getSiteQuerySchema),
    async (c) => {
      const { pageId, slug } = c.req.valid("query");

      const program = pipe(
        getSiteBySlugWithPage(slug, pageId),
        Effect.provide(DatabaseLive()),
        Effect.provide(NotionServiceLive()),
        Effect.provide(NotionClientLive),
      );

      const site = await Effect.runPromise(program);
      return c.json(
        ApiResponse({
          data: { ...site },
          message: "Site fetched successfully",
        }),
      );
    },
  )
  .use(authMiddleWare())
  .get(
    "/all",
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    async (c) => {
      const userId = c.get("user")?.id;

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo();
        const userSites = yield* repo.findById("userId", userId as string);
        return userSites;
      }).pipe(Effect.provide(DatabaseLive()));
      const sites = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: sites,
          message: "Sites fetched successfully",
        }),
      );
    },
  )
  .use(
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_WRITE_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
  )
  .post(
    "/",
    zValidator(
      "json",
      sitesInsertSchema.omit({ userId: true }).extend({
        slug: SlugSchema,
      }),
    ),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const input = c.req.valid("json");

      const program = createSite({ ...input, userId }).pipe(
        Effect.provide(DatabaseLive()),
        Effect.provide(NotionServiceLive()),
        Effect.provide(NotionClientLive),
        Effect.provide(SlugServiceLive),
        Effect.provide(KVStoreLive),
      );

      const site = await Effect.runPromise(program);
      await KeyManager.delete.getUserSites(userId as string);

      return c.json(
        ApiResponse({
          data: site,
          message: "Site created successfully",
        }),
      );
    },
  )
  .post(
    "/slug/available",
    zValidator(
      "json",
      z.object({
        slug: SlugSchema,
      }),
    ),
    async (c) => {
      const { slug } = c.req.valid("json");
      const program = isSlugAvailable(slug).pipe(
        Effect.provide(SlugServiceLive),
        Effect.provide(KVStoreLive),
      );

      const res = await Effect.runPromise(program);
      return c.json(ApiResponse({ data: res, message: "success" }));
    },
  )
  .patch(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator(
      "json",
      sitesInsertSchema.omit({ userId: true }).extend({
        slug: SlugSchema,
      }),
    ),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo();
        const existing = yield* repo.findById("id", id);

        if (!existing || !existing.length) {
          return yield* Effect.fail("site/update/id no data error");
        }

        if (input.slug !== existing[0].slug) {
          const slugService = yield* SlugService;
          const storedSlug = yield* slugService.storeSlug(input.slug);
          const deletedSlug = yield* slugService.deleteSlug(existing[0].slug);
        }

        const site = yield* repo.updateById("id", id, { ...input, userId });
        return site.length ? site[0] : null;
      }).pipe(
        Effect.provide(DatabaseLive()),
        Effect.provide(SlugServiceLive),
        Effect.provide(KVStoreLive),
      );

      const site = await Effect.runPromise(program);
      await KeyManager.delete.getUserSites(userId as string);
      await KeyManager.delete.getSiteById(input.pageId ?? "");
      await KeyManager.delete.getPageContent(input.pageId ?? "");

      return c.json(
        ApiResponse({
          data: site,
          message: "Site updated successfully",
        }),
      );
    },
  )
  .delete(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("query", z.object({ pageId: z.string() })),
    async (c) => {
      const userId = c.get("user")?.id;
      const { id } = c.req.valid("param");
      const { pageId } = c.req.valid("query");

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo();
        const site = yield* repo.deleteById("id", id);
        return site.length ? site[0] : null;
      }).pipe(
        Effect.tap((data) =>
          Effect.gen(function* () {
            if (!data) {
              return yield* Effect.fail("site/delete/id no data error");
            }

            const slugService = yield* SlugService;
            yield* slugService.deleteSlug(data.slug);
          }),
        ),

        Effect.provide(DatabaseLive()),
        Effect.provide(SlugServiceLive),
        Effect.provide(KVStoreLive),
      );

      const site = await Effect.runPromise(program);
      await KeyManager.delete.getUserSites(userId as string);
      await KeyManager.delete.getSiteById(id);
      await KeyManager.delete.getPageContent(pageId);

      return c.json(
        ApiResponse({
          data: site,
          message: "Site deleted successfully",
        }),
      );
    },
  );

export { sitesApp };
