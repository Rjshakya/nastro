import { getDB } from "@/db";
import { account } from "@/db/schema/auth-schema";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

export const getAccessToken = (userId: string, providerId: string) => {
  return Effect.tryPromise({
    try: async () => {
      const db = await getDB();
      const [acc] = await db
        .select()
        .from(account)
        .where(
          and(eq(account.userId, userId), eq(account.providerId, providerId)),
        );

      const { accessToken, refreshToken, providerId: provider } = acc;
      return { accessToken, refreshToken, provider };
    },
    catch: (e) => {
      console.log(e);
      return "getAccessTokenError" as const;
    },
  });
};
