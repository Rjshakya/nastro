import { getDB } from "@/db";
import { account } from "@/db/schema/auth-schema";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

export type GetAccessTokenResult = Effect.Effect<
  {
    accessToken: string | null;
    refreshToken: string | null;
    provider: string;
    accountId: string;
  },
  "getAccessTokenError",
  never
>;

export const getAccessToken = (
  userId: string,
  providerId: "notion" | "google",
): GetAccessTokenResult => {
  return Effect.tryPromise({
    try: async () => {
      const db = await getDB();
      const [acc] = await db
        .select()
        .from(account)
        .where(
          and(eq(account.userId, userId), eq(account.providerId, providerId)),
        );

      return {
        accessToken: acc?.accessToken,
        refreshToken: acc?.refreshToken,
        provider: acc?.providerId,
        accountId: acc?.accountId,
      };
    },
    catch: (e) => {
      console.log(e);
      return "getAccessTokenError" as const;
    },
  });
};
