import { env } from "cloudflare:workers";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Data, Effect, Layer, ServiceMap } from "effect";

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: any;
}> {}

export const getDB = async () => drizzle(env.HYPERDRIVE.connectionString);
export const getDBeffect = Effect.tryPromise({
  try: getDB,
  catch: (e) => new DatabaseError({ message: e }),
});

export class DataBase extends ServiceMap.Service<
  DataBase,
  {
    readonly getDb: () => Effect.Effect<NodePgDatabase, DatabaseError, never>;
  }
>()("DataBase") {}

export const DatabaseLive = Layer.succeed(DataBase, {
  getDb: () =>
    Effect.tryPromise({
      try: getDB,
      catch: (e) => new DatabaseError({ message: e }),
    }),
});
