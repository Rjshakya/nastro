import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { themeTable } from "@/db/schema/theme";
import { Effect } from "effect";

export const ThemeRepo = Effect.fn("ThemeRepo")(() =>
  Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    return makeRepo(db, themeTable);
  }),
);
