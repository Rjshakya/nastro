import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { seoTable } from "@/db/schema/seo";
import { Effect } from "effect";

export const SeoRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, seoTable);
});
