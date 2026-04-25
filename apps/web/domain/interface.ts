import { env } from "cloudflare:workers";
import { hcWithType, type serverTypes } from "server/hc";

export const client = hcWithType(env.API_URL, {
  init: { credentials: "include" },
});

export type { serverTypes as ApiTypes };
