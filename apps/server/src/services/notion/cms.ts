import {
  blocksToHtml,
  blocksToMarkdown,
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
        const page = await this.cms.getPageContent(pageId);
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
        const page = await this.cms.getPageContent(pageId);
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
        const page = await this.cms.getRecord(pageId);
        return page;
      },
      catch: (e) =>
        new NotionCMSServiceError({
          message:
            e instanceof Error ? e.message : ("getNotionPageRecord" as const),
        }),
    });
  }
}
