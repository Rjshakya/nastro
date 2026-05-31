import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { customDomainTable } from "@/db/schema/custom-domain";
import { Effect } from "effect";

export const CustomDomainRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, customDomainTable);
});
