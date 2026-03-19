import { InferInsertModel, InferSelectModel, Table } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Data, Effect } from "effect";

class RepoError extends Data.TaggedError("RepoError")<{
  readonly error: any;
}> {}

export interface Repo<T extends Table<any>, ResultType extends InferSelectModel<T>> {
  findAll: () => Effect.Effect<ResultType[], RepoError, never>;
  findById: (
    key: keyof InferSelectModel<T>,
    id: string,
  ) => Effect.Effect<ResultType[], RepoError, never>;
  insert: (data: InferInsertModel<T>) => Effect.Effect<ResultType[], RepoError, never>;
  insertVoid: (data: InferInsertModel<T>) => Effect.Effect<void, RepoError, never>;
  updateById: (
    key: keyof InferSelectModel<T>,
    id: string,
    data: InferInsertModel<T>,
  ) => Effect.Effect<ResultType[], RepoError, never>;
  deleteById: (
    key: keyof InferSelectModel<T>,
    id: string,
  ) => Effect.Effect<ResultType[], RepoError, never>;
  execute: <R, E>(
    f: (db: NodePgDatabase, table: T) => Effect.Effect<R, E, never>,
  ) => Effect.Effect<R, E, never>;
}

export const makeRepo = <T extends Table<any>, ResultType extends InferSelectModel<T>>(
  db: NodePgDatabase,
  table: T,
): Repo<T, ResultType> => {
  const findAll = () =>
    Effect.tryPromise({
      try: async () => {
        return (await db.select().from(table as Table<any>)) as ResultType[];
      },
      catch: (error) => new RepoError({ error }),
    });

  const findById = (key: keyof InferSelectModel<T>, id: string) =>
    Effect.tryPromise({
      try: async () => {
        return (await db
          .select()
          .from(table as Table<any>)
          // @ts-expect-error  column type error
          .where(eq(table[key], id))) as ResultType[];
      },
      catch: (error) => new RepoError({ error }),
    });

  const insert = (data: InferInsertModel<T>) =>
    Effect.tryPromise({
      try: async () => {
        const res = (await db.insert(table).values(data).returning()) as unknown as ResultType[];
        return res;
      },
      catch: (error) => new RepoError({ error }),
    });

  const insertVoid = (data: InferInsertModel<T>) =>
    Effect.tryPromise({
      try: async () => {
        await db.insert(table).values(data);
      },
      catch: (error) => new RepoError({ error }),
    });

  const updateById = (key: keyof InferSelectModel<T>, id: string, data: InferInsertModel<T>) =>
    Effect.tryPromise({
      try: async () => {
        return (await db
          .update(table)
          .set(data)
          // @ts-expect-error  column type error
          .where(eq(table[key], id))
          .returning()) as unknown as ResultType[];
      },
      catch: (error) => new RepoError({ error }),
    });

  const deleteById = (key: keyof InferSelectModel<T>, id: string) =>
    Effect.tryPromise({
      try: async () => {
        return (await db
          .delete(table)
          // @ts-expect-error  column type error
          .where(eq(table[key], id))) as unknown as ResultType[];
      },
      catch: (error) => new RepoError({ error }),
    });

  const execute = <R, E>(f: (db: NodePgDatabase, table: T) => Effect.Effect<R, E>) =>
    Effect.tryPromise({
      try: async () => {
        return f(db, table);
      },
      catch: (error) => new RepoError({ error }) as E,
    }).pipe(Effect.flatMap((res) => res));

  return {
    insert,
    insertVoid,
    updateById,
    deleteById,
    findAll,
    findById,
    execute,
  };
};
