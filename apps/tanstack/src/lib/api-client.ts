import { Env } from "env";
import { hcWithType, type serverTypes } from "server/hc";

export const client = hcWithType(Env.apiUrl, {
  init: { credentials: "include" },
});

export type { serverTypes as ApiTypes };
