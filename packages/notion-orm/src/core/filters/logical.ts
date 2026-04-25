import { Filter } from "./types.js";

export function and(...conditions: Filter[]): Filter {
  return { and: conditions } as Filter;
}

export function or(...conditions: Filter[]): Filter {
  return { or: conditions } as Filter;
}
