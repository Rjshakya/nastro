import { env } from "cloudflare:workers";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Effect, Layer, ServiceMap } from "effect";

import { DatabaseError } from "@/errors/tagged.errors";

export const getDB = async (connectionString?: string) =>
  drizzle(env.HYPERDRIVE.connectionString);
export const getDBeffect = Effect.tryPromise({
  try: async () => getDB(),
  catch: (e) =>
    new DatabaseError({
      message: String(e),
      type: "CONNECTION_FAILED",
      code: 500,
    }),
});

export class DataBase extends ServiceMap.Service<
  DataBase,
  {
    readonly getDb: () => Effect.Effect<NodePgDatabase, DatabaseError, never>;
  }
>()("DataBase") {}

export const DatabaseLive = (connectionString?: string) =>
  Layer.succeed(DataBase, {
    getDb: () =>
      Effect.tryPromise({
        try: async () => getDB(connectionString),
        catch: (e) =>
          new DatabaseError({
            message: String(e),
            type: "CONNECTION_FAILED",
            code: 500,
          }),
      }),
  });
