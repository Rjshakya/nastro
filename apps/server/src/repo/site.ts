import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { sites } from "@/db/schema/site";
import { Effect } from "effect";

export const SiteRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, sites);
});
