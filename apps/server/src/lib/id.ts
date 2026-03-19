import { Effect } from "effect";
import { v7 } from "uuid";

export const generateId = (): Effect.Effect<string> => {
  return Effect.succeed(v7());
};
