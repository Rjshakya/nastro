import { app } from "./app";
import { hc } from "hono/client";
import type * as serverTypes from "./server-types";

// this is a trick to calculate the type when compiling
export type Client = ReturnType<typeof hc<typeof app>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);
export type { serverTypes };
