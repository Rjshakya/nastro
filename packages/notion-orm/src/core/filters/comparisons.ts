import { ComparableColumn, ComparableColumnValue, Filter } from "../types.js";

function createComparisonFilter(
  column: ComparableColumn,
  value: number | string,
  numberOp: "greater_than" | "less_than" | "greater_than_or_equal_to" | "less_than_or_equal_to",
  dateOp: "after" | "before" | "on_or_after" | "on_or_before",
): Filter | null {
  const property = column.name as string;
  const type = column.type;

  if (type === "number" || type === "unique_id") {
    return { property, [type]: { [numberOp]: value } } as Filter;
  }

  if (type === "date" || type === "created_time" || type === "last_edited_time") {
    return { property, [type]: { [dateOp]: value } } as Filter;
  }

  return null;
}

export function gt<T extends ComparableColumn>(
  column: T,
  value: ComparableColumnValue<T>,
): Filter | null {
  return createComparisonFilter(column, value, "greater_than", "after");
}

export function gte<T extends ComparableColumn>(
  column: T,
  value: ComparableColumnValue<T>,
): Filter | null {
  return createComparisonFilter(column, value, "greater_than_or_equal_to", "on_or_after");
}

export function lt<T extends ComparableColumn>(
  column: T,
  value: ComparableColumnValue<T>,
): Filter | null {
  return createComparisonFilter(column, value, "less_than", "before");
}

export function lte<T extends ComparableColumn>(
  column: T,
  value: ComparableColumnValue<T>,
): Filter | null {
  return createComparisonFilter(column, value, "less_than_or_equal_to", "on_or_before");
}
