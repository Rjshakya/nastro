import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { visitors } from "@/db/schema/analytics";
import { Effect } from "effect";

export const AnalyticsRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, visitors);
});
