import { Effect, Layer, ServiceMap } from "effect";
import type { CustomerState } from "@polar-sh/sdk/models/components/customerstate.js";

import { polarClient } from "@/lib/polar";
import { CacheService } from "@/services/cache";
import { BillingError } from "@/errors/tagged.errors";

const CUSTOMER_STATE_TTL_SECONDS = 60;

export class BillingClient extends ServiceMap.Service<BillingClient>()(
  "services/billing-client",
  {
    make: Effect.gen(function* () {
      const cache = yield* CacheService;

      const getCustomer = (externalId: string) =>
        Effect.tryPromise({
          try: () => polarClient.customers.getExternal({ externalId }),
          catch: (error) =>
            new BillingError({
              message: `Failed to fetch Polar customer: ${String(error)}`,
              type: "CUSTOMER_STATE_FAILED",
              code: 500,
            }),
        });

      const fetchCustomerState = (externalId: string) =>
        Effect.tryPromise({
          try: () => polarClient.customers.getStateExternal({ externalId }),
          catch: (error) =>
            new BillingError({
              message: `Failed to fetch Polar customer state: ${String(error)}`,
              type: "CUSTOMER_STATE_FAILED",
              code: 500,
            }),
        });

      const getCustomerState = (externalId: string) =>
        Effect.gen(function* () {
          const cacheKey = cache.keys.customerState(externalId);
          const cached = yield* cache.get<CustomerState>(cacheKey);
          if (cached) return cached;
          const state = yield* fetchCustomerState(externalId);
          yield* cache.set(cacheKey, state, CUSTOMER_STATE_TTL_SECONDS);
          return state;
        });

      const invalidateCustomerState = (externalId: string) =>
        Effect.gen(function* () {
          const cacheKey = cache.keys.customerState(externalId);
          yield* cache.delete(cacheKey);
        });

      return { getCustomer, getCustomerState, invalidateCustomerState };
    }),
  },
) {}

export const BillingClientLive = Layer.effect(
  BillingClient,
  BillingClient.make,
);
