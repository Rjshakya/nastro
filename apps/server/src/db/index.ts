import { env } from "cloudflare:workers";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Data, Effect, Layer, ServiceMap } from "effect";

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: any;
}> {}

export const getDB = async (connectionString?: string) =>
  drizzle(env.HYPERDRIVE.connectionString);
export const getDBeffect = Effect.tryPromise({
  try: async () => getDB(),
  catch: (e) => new DatabaseError({ message: e }),
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
        catch: (e) => new DatabaseError({ message: e }),
      }),
  });
