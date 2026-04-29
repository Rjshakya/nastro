import { Env } from "@/lib/env";
import { hcWithType, type serverTypes } from "server/hc";

export const client = hcWithType(Env.apiUrl, {
  init: { credentials: "include" },
});

export type { serverTypes as ApiTypes };
