import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "@/db"; // your drizzle instance
import { account, user, session, verification } from "@/db/schema/auth-schema";
import { env } from "cloudflare:workers";

export const getAuth = async () => {
  const db = await getDB();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        account,
        user,
        session,
        verification,
      },
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      notion: {
        clientId: env.NOTION_CLIENT_ID,
        clientSecret: env.NOTION_CLIENT_SECRET,
      },
    },
    trustedOrigins: [env.CLIENT_URL],
    account: {
      accountLinking: { trustedProviders: ["notion", "google"] },
    },
  });
};
