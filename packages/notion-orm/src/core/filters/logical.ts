import { Filter } from "../types.js";

export type FilterCondition = NonNullable<Filter>;

export function and(...conditions: FilterCondition[]): FilterCondition {
  return { and: conditions } as FilterCondition;
}

export function or(...conditions: FilterCondition[]): FilterCondition {
  return { or: conditions } as FilterCondition;
}
