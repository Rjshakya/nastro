import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { apikey } from "@/db/schema/auth-schema";
import { Effect } from "effect";

export const ApiKeyRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, apikey);
});
