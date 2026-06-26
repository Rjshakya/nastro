import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Effect, Layer } from "effect";
import { getDB } from "@/db";
import {
  account,
  user,
  session,
  verification,
  apikey as apiKeyTable,
} from "@/db/schema/auth-schema";
import { env } from "cloudflare:workers";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";

import { polarClient } from "@/lib/polar";
import { BillingClient, BillingClientLive } from "@/services/billing-client";
import { CacheServiceLive } from "@/services/cache";
import { KVStoreLive } from "@/services/kv-store";

const invalidateCustomerState = async (externalId?: string | null) => {
  if (!externalId) {
    return;
  }

  const programLayer = BillingClientLive.pipe(
    Layer.provide(CacheServiceLive),
    Layer.provide(KVStoreLive),
  );

  const program = Effect.gen(function* () {
    const client = yield* BillingClient;
    yield* client.invalidateCustomerState(externalId);
  }).pipe(Effect.provide(programLayer));

  try {
    await Effect.runPromise(program);
  } catch (error) {
    console.error("Failed to invalidate customer state:", error);
  }
};

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
        apiKey: apiKeyTable,
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
    trustedOrigins: [env.CLIENT_URL, "https://*.nastro.xyz"],
    account: {
      accountLinking: { trustedProviders: ["notion", "google"] },
    },
    plugins: [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          portal(),
          usage(),
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET as string,
            onSubscriptionCreated: async (payload) => {
              await invalidateCustomerState(payload.data.customer.externalId);
            },
            onSubscriptionUpdated: async (payload) => {
              await invalidateCustomerState(payload.data.customer.externalId);
            },
            onOrderPaid: async (payload) => {
              await invalidateCustomerState(payload.data.customer.externalId);
            },
            onPayload: async (payload) => {
              console.log(payload);
            },
          }),

          checkout({
            products: [
              {
                productId: "123-456-789",
                slug: "pro",
              },
            ],
            successUrl: "/success?checkout_id={CHECKOUT_ID}",
            authenticatedUsersOnly: true,
          }),
        ],
      }),
    ],

    user: {
      deleteUser: {
        afterDelete: async (user) => {
          await polarClient.customers.deleteExternal({
            externalId: user.id,
          });
        },
      },
    },
  });
};
