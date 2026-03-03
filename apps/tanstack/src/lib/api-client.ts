import { Env } from "env";
import { hcWithType } from "server/hc";

export const client = hcWithType(Env.apiUrl, {
  init: { credentials: "include" },
});
