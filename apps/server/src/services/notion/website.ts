import { Data, Effect } from "effect";
import { NotionAPI } from "notion-client";
import type { ExtendedRecordMap } from "notion-types";

class NotionRendererError extends Data.TaggedError("NotionRendererError")<{
  message: string;
}> {}

export class NotionWebsiteService {
  client: NotionAPI;

  constructor(client: NotionAPI) {
    this.client = client;
  }

  getPage(pageId: string) {
    return Effect.tryPromise({
      try: async () => {

        const page = await this.client.getPage(pageId);
        return page as ExtendedRecordMap;
      },
      catch: (e) => {
        console.log(e);
        return new NotionRendererError({
          message:
            e instanceof Error ? e.message : "NotionRenderer : getPage error",
        });
      },
    });
  }
}
