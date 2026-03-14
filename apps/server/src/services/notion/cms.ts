import { getNotionCms } from "@/lib/notion";
import { getAccessToken } from "@/lib/tokens";
import {
  blocksToHtml,
  blocksToMarkdown,
  convertRecordToAdvanced,
  NotionCMS,
} from "@mikemajara/notion-cms";
import { Data, Effect } from "effect";

class NotionCMSServiceError extends Data.TaggedError("NotionCMSServiceError")<{
  readonly message: string;
}> {}

export class NotionCMSService {
  cms: NotionCMS;

  constructor(cms: NotionCMS) {
    this.cms = cms;
  }

  getNotionPageHTML(pageId: string) {
    return Effect.tryPromise({
      try: async () => {
        const page = await this.cms.getPageContent(pageId, { recursive: true });
        const html = blocksToHtml(page);
        return html;
      },
      catch: (e) =>
        new NotionCMSServiceError({
          message:
            e instanceof Error ? e.message : ("get notion page html" as const),
        }),
    });
  }

  getNotionPageMarkdown(pageId: string) {
    return Effect.tryPromise({
      try: async () => {
        const page = await this.cms.getPageContent(pageId, { recursive: true });
        const md = blocksToMarkdown(page);
        return md;
      },
      catch: (e) =>
        new NotionCMSServiceError({
          message:
            e instanceof Error ? e.message : ("getNotionPageMarkdown" as const),
        }),
    });
  }

  getNotionPageRecord(pageId: string) {
    return Effect.tryPromise({
      try: async () => {
        const record = await this.cms.getRecord(pageId);
        const { archived, cover, icon, url  } = record;
        const simpleRecord = await convertRecordToAdvanced(record);
        simpleRecord["archived"] = archived;
        simpleRecord["cover"] = cover;
        simpleRecord["icon"] = icon;
        simpleRecord["notionUrl"] = url;
        return simpleRecord;
      },
      catch: (e) =>
        new NotionCMSServiceError({
          message:
            e instanceof Error ? e.message : ("getNotionPageRecord" as const),
        }),
    });
  }

  getNotionPage(pageId: string) {
    const page = Effect.all(
      [this.getNotionPageRecord(pageId), this.getNotionPageMarkdown(pageId)],
      { concurrency: "unbounded" },
    );

    return Effect.gen(function* () {
      const [record, md] = yield* page;
      record["content"] = { markdown: md };
      return record;
    });
  }
}

export const getNotionPageHTML = Effect.fn("getNotionPageHTML")((
  pageId: string,
  notionToken: string,
) => {
  return Effect.gen(function* () {
    const cms = getNotionCms(notionToken);
    const cmsService = new NotionCMSService(cms);
    return yield* cmsService.getNotionPageHTML(pageId);
  });
});

export const getNotionPageMarkdown = Effect.fn("getNotionPageMarkdown")((
  pageId: string,
  notionToken: string,
) => {
  return Effect.gen(function* () {
    const cms = getNotionCms(notionToken);
    const cmsService = new NotionCMSService(cms);
    return yield* cmsService.getNotionPageMarkdown(pageId);
  });
});

export const getNotionPageRecord = Effect.fn("getNotionPageRecord")((
  pageId: string,
  notionToken: string,
) => {
  return Effect.gen(function* () {
    const cms = getNotionCms(notionToken);
    const cmsService = new NotionCMSService(cms);
    return yield* cmsService.getNotionPageRecord(pageId);
  });
});

export const getNotionPageFullContent = Effect.fn("getNotionPageFullContent")((
  pageId: string,
  notionToken: string,
) => {
  return Effect.gen(function* () {
    const cms = getNotionCms(notionToken);
    const cmsService = new NotionCMSService(cms);
    return yield* cmsService.getNotionPage(pageId);
  });
});

const formatMap = {
  html: getNotionPageHTML,
  md: getNotionPageMarkdown,
  full: getNotionPageFullContent,
};

export const getNotionPageFromCMS = Effect.fn("getNotionPageFromCMS")(({
  format,
  pageId,
  userId,
}: {
  format: "html" | "md" | "full";
  pageId: string;
  userId: string;
}) => {
  return Effect.gen(function* () {
    const { accessToken } = yield* getAccessToken(userId, "notion");
    if (!accessToken) {
      yield* Effect.fail(new Error("NO ACCESS TOKEN FOR NOTION"));
    }

    const effect = formatMap[format];
    return yield* effect(pageId, accessToken!);
  });
});
