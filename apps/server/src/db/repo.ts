import { eq, InferInsertModel, InferSelectModel, Table } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Effect } from "effect";
import { RepoError } from "@/errors/tagged.errors";

export interface Repo<T extends Table<any>, ResultType extends InferSelectModel<T>> {
  findAll: (limit?: number) => Effect.Effect<ResultType[], RepoError, never>;
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
  const findAll = (limit?: number) =>
    Effect.tryPromise({
      try: async () => {
        return (await db
          .select()
          .from(table as Table<any>)
          .limit(limit ?? 100)) as ResultType[];
      },
      catch: (error) =>
        new RepoError({
          message: String(error),
          type: "FAILED_TO_FIND_ALL",
          code: 500,
        }),
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
      catch: (error) => {
        console.error(error);
        return new RepoError({
          message: String(error),
          type: "FAILED_TO_FIND_BY_ID",
          code: 500,
        });
      },
    });

  const insert = (data: InferInsertModel<T>) =>
    Effect.tryPromise({
      try: async () => {
        const res = (await db.insert(table).values(data).returning()) as unknown as ResultType[];
        return res;
      },
      catch: (error) =>
        new RepoError({
          message: String(error),
          type: "FAILED_TO_INSERT",
          code: 500,
        }),
    });

  const insertVoid = (data: InferInsertModel<T>) =>
    Effect.tryPromise({
      try: async () => {
        await db.insert(table).values({ ...data, id: "" });
      },
      catch: (error) =>
        new RepoError({
          message: String(error),
          type: "FAILED_TO_INSERT",
          code: 500,
        }),
    });

  const updateById = (key: keyof InferSelectModel<T>, id: string, data: InferInsertModel<T>) =>
    Effect.tryPromise({
      try: async () => {
        return (await db
          .update(table)
          //@ts-ignore
          .set(data)
          // @ts-expect-error  column type error
          .where(eq(table[key], id))
          .returning()) as unknown as ResultType[];
      },
      catch: (error) =>
        new RepoError({
          message: String(error),
          type: "FAILED_TO_UPDATE_BY_ID",
          code: 500,
        }),
    });

  const deleteById = (key: keyof InferSelectModel<T>, id: string) =>
    Effect.tryPromise({
      try: async () => {
        return (await db
          .delete(table)
          // @ts-expect-error  column type error
          .where(eq(table[key], id))
          .returning()) as unknown as ResultType[];
      },
      catch: (error) =>
        new RepoError({
          message: String(error),
          type: "FAILED_TO_DELETE_BY_ID",
          code: 500,
        }),
    });

  const execute = <R, E>(f: (db: NodePgDatabase, table: T) => Effect.Effect<R, E>) =>
    Effect.tryPromise({
      try: async () => {
        return f(db, table);
      },
      catch: (error) =>
        new RepoError({
          message: String(error),
          type: "FAILED_TO_EXECUTE",
          code: 500,
        }) as E,
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
