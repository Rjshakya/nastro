import { hcWithType } from "server/hc";

export const client = hcWithType(import.meta.env.PUBLIC_API_URL, {
  init: { credentials: "include" },
});
