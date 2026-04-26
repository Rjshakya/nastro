import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { templateTable } from "@/db/schema/template";
import { Effect } from "effect";

export const TemplateRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, templateTable);
});
