import { Effect, Layer, ServiceMap } from "effect";

import { BillingClient } from "@/services/billing-client";
import { BillingError } from "@/errors/tagged.errors";
import { CustomerState } from "@polar-sh/sdk/models/components/customerstate.js";

export const FREE_PLAN_MAX_SITES = 5;
export const PRO_PLAN_MAX_CUSTOM_DOMAINS = 1;

export type ProFeature =
  | "custom_domain"
  | "custom_css"
  | "custom_script"
  | "google_analytics"
  | "advanced_analytics";

const isCustomerPro = (customerState: CustomerState): boolean => {
  console.log("customerState", customerState);
  return customerState.activeSubscriptions?.length
    ? customerState.activeSubscriptions?.some(
        (subscription) => subscription.status === "active",
      )
    : false;
};

export class BillingService extends ServiceMap.Service<BillingService>()(
  "services/billing",
  {
    make: Effect.gen(function* () {
      const billingClient = yield* BillingClient;

      const getState = (userId: string) =>
        billingClient.getCustomerState(userId).pipe(
          Effect.catchTag("BillingError", (error) =>
            Effect.fail(
              new BillingError({
                message: error.message,
                type: "CUSTOMER_STATE_FAILED",
                code: error.code,
              }),
            ),
          ),
        );

      const canCreateSite = (userId: string, currentSiteCount: number) =>
        Effect.gen(function* () {
          const state = yield* getState(userId);

          if (isCustomerPro(state)) {
            return true;
          }

          if (currentSiteCount >= FREE_PLAN_MAX_SITES) {
            return false;
          }

          return true;
        });

      const canUpdateSite = (userId: string, requestedFeatures: ProFeature[]) =>
        Effect.gen(function* () {
          if (requestedFeatures.length === 0) {
            return true;
          }

          const state = yield* getState(userId);

          if (isCustomerPro(state)) {
            return true;
          }

          return false;
        });

      const canAddCustomDomain = (
        userId: string,
        currentCustomDomainCount: number,
      ) =>
        Effect.gen(function* () {
          const state = yield* getState(userId);

          if (!isCustomerPro(state)) {
            return false;
          }

          if (currentCustomDomainCount >= PRO_PLAN_MAX_CUSTOM_DOMAINS) {
            return yield* new BillingError({
              message: `Pro plan is limited to ${PRO_PLAN_MAX_CUSTOM_DOMAINS} custom domain.`,
              type: "CUSTOM_DOMAIN_LIMIT_REACHED",
              code: 403,
            });
          }

          return true;
        });

      const canViewAdvancedAnalytics = (userId: string) =>
        Effect.gen(function* () {
          const state = yield* getState(userId);
          if (!isCustomerPro(state)) {
            return yield* new BillingError({
              message: "This feature require Pro plan",
              type: "PRO_FEATURE_REQUIRED",
              code: 403,
            });
          }

          return true;
        });

      const isProCustomer = (userId: string) => {
        return Effect.gen(function* () {
          const state = yield* getState(userId);
          return isCustomerPro(state);
        });
      };

      return {
        canCreateSite,
        canUpdateSite,
        canAddCustomDomain,
        canViewAdvancedAnalytics,
        isProCustomer,
      };
    }),
  },
) {}

export const BillingServiceLive = Layer.effect(
  BillingService,
  BillingService.make,
);
