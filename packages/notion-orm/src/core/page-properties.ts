import { PageObjectResponse } from "@notionhq/client";
import type {
  CheckboxPropertyRequest,
  Column,
  ColumnTypeMap,
  DatePropertyRequest,
  EmailPropertyRequest,
  FilesPropertyRequest,
  InferInsertType,
  InferSelectType,
  MultiSelectPropertyRequest,
  NotionPagePropertyRequest,
  NotionTable,
  NumberPropertyRequest,
  PeoplePropertyRequest,
  PhoneNumberPropertyRequest,
  RichTextPropertyRequest,
  SelectPropertyRequest,
  StatusPropertyRequest,
  TitlePropertyRequest,
  UrlPropertyRequest,
} from "./types.ts";

export function convertPageObjectToSelectType<
  T extends NotionTable,
  MultiSelectEnum,
  SelectEnum,
  StatusEnum,
>(
  props: T["properties"],
  page: PageObjectResponse,
): InferSelectType<T, MultiSelectEnum, SelectEnum> {
  const result = { id: page.id } as InferSelectType<T, MultiSelectEnum, SelectEnum>;

  for (const [key, column] of Object.entries(props)) {
    const propValue = page.properties[key];

    // Property missing from page → set null
    if (!propValue) {
      (result as Record<string, unknown>)[key] = null;
      continue;
    }

    const v = propValue as { type: string } & Record<string, unknown>;

    switch (column.type) {
      case "title": {
        const items = v.title as Array<{ plain_text: string }>;
        (result as Record<string, unknown>)[key] = items.map((t) => t.plain_text).join("");
        break;
      }
      case "rich_text": {
        const items = v.rich_text as Array<{ plain_text: string }>;
        (result as Record<string, unknown>)[key] = items.map((t) => t.plain_text).join("");
        break;
      }
      case "number": {
        (result as Record<string, unknown>)[key] = v.number ?? null;
        break;
      }
      case "select": {
        const sel = v.select as { name: string } | null;
        (result as Record<string, unknown>)[key] = sel?.name ?? null;
        break;
      }
      case "multi_select": {
        const items = (v.multi_select as Array<{ name: string }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((x) => ({ name: x.name }));
        break;
      }
      case "status": {
        const st = v.status as { name: string } | null;
        (result as Record<string, unknown>)[key] = st?.name ?? "";
        break;
      }
      case "date": {
        const d = v.date as { start: string } | null;
        (result as Record<string, unknown>)[key] = d?.start ?? null;
        break;
      }
      case "people": {
        const items = (v.people as Array<{ id: string }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((p) => ({ id: p.id }));
        break;
      }
      case "files": {
        const items =
          (v.files as Array<{
            name: string;
            type: "external" | "file";
            external?: { url: string };
            file?: { url: string };
          }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((f) => ({
          name: f.name,
          url: f.type === "external" ? f.external!.url : f.file!.url,
          type: f.type,
        }));
        break;
      }
      case "checkbox": {
        (result as Record<string, unknown>)[key] = v.checkbox ?? false;
        break;
      }
      case "url": {
        (result as Record<string, unknown>)[key] = (v.url as string | null) ?? null;
        break;
      }
      case "email": {
        (result as Record<string, unknown>)[key] = (v.email as string | null) ?? null;
        break;
      }
      case "phone_number": {
        (result as Record<string, unknown>)[key] = (v.phone_number as string | null) ?? null;
        break;
      }
      case "relation": {
        const items = (v.relation as Array<{ id: string }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((r) => ({ id: r.id }));
        break;
      }
      case "unique_id": {
        const uid = v.unique_id as { prefix: string | null; number: number | null } | null;
        (result as Record<string, unknown>)[key] = uid?.number ?? null;
        break;
      }
      case "created_time": {
        (result as Record<string, unknown>)[key] = (v.created_time as string) ?? "";
        break;
      }
      case "created_by": {
        const cb = v.created_by as { id: string } | null;
        (result as Record<string, unknown>)[key] = cb?.id ?? "";
        break;
      }
      case "last_edited_time": {
        (result as Record<string, unknown>)[key] = (v.last_edited_time as string) ?? "";
        break;
      }
      case "last_edited_by": {
        const leb = v.last_edited_by as { id: string } | null;
        (result as Record<string, unknown>)[key] = leb?.id ?? "";
        break;
      }
      // formula / rollup are excluded from InferSelectType — skip
      default:
        break;
    }
  }

  return result;
}

function isReadOnlyColumn(column: Column): boolean {
  switch (column.type) {
    case "formula":
    case "rollup":
    case "unique_id":
    case "created_time":
    case "created_by":
    case "last_edited_time":
    case "last_edited_by":
    case "last_visited_time":
    case "place":
    case "button":
    case "location":
    case "verification":
      return true;
    default:
      return false;
  }
}

export function convertToPageProperties<
  T extends NotionTable,
  MultiSelectEnum,
  SelectEnum,
  StatusEnum,
>(
  data: InferInsertType<T, MultiSelectEnum, SelectEnum, StatusEnum>,
  table: T,
): NotionPagePropertyRequest {
  const props = Object.entries(data).reduce((acc, curr) => {
    const [name, value] = curr;
    const col = table["properties"][name];

    if (isReadOnlyColumn(col)) return acc;

    switch (col.type) {
      case "title":
        acc[name] = handleTitle(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["title"],
        );
        break;
      case "checkbox":
        acc[name] = handleCheckbox(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["checkbox"],
        );
        break;
      case "rich_text":
        acc[name] = handleRichText(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["rich_text"],
        );
        break;
      case "number":
        acc[name] = handleNumber(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["number"],
        );
        break;
      case "select":
        acc[name] = handleSelect(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["select"],
        );
        break;
      case "multi_select":
        acc[name] = handleMultiSelect(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["multi_select"],
        );
        break;
      case "status":
        acc[name] = handleStatus(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["status"],
        );
        break;
      case "date":
        acc[name] = handleDate(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["date"],
        );
        break;
      case "people":
        acc[name] = handlePeople(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["people"],
        );
        break;
      case "files":
        acc[name] = handleFiles(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["files"],
        );
        break;
      case "url":
        acc[name] = handleUrl(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["url"],
        );
        break;
      case "email":
        acc[name] = handleEmail(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["email"],
        );
        break;
      case "phone_number":
        acc[name] = handlePhoneNumber(
          value as ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["phone_number"],
        );
        break;
    }

    return acc;
  }, {} as NotionPagePropertyRequest);

  return props;
}

export function handleTitle<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["title"],
): TitlePropertyRequest {
  return {
    type: "title",
    title: [
      {
        type: "text",
        text: {
          content: value,
        },
      },
    ],
  };
}

export function handleCheckbox<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["checkbox"],
): CheckboxPropertyRequest {
  return {
    type: "checkbox",
    checkbox: value,
  };
}

export function handleRichText<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["rich_text"],
): RichTextPropertyRequest {
  return {
    type: "rich_text",
    rich_text: [
      {
        type: "text",
        text: {
          content: value,
        },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
      },
    ],
  };
}

export function handleNumber<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["number"],
): NumberPropertyRequest {
  return {
    type: "number",
    number: value,
  };
}

export function handleSelect<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["select"],
): SelectPropertyRequest {
  return {
    type: "select",
    select: {
      name: value as string,
    },
  };
}

export function handleMultiSelect<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["multi_select"],
): MultiSelectPropertyRequest {
  return {
    type: "multi_select",
    multi_select: value.map((v) => ({ name: v.name as string })),
  };
}

export function handleStatus<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["status"],
): StatusPropertyRequest {
  return {
    type: "status",
    status: {
      name: value as string,
    },
  };
}

export function handleDate<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["date"],
): DatePropertyRequest {
  return {
    type: "date",
    date: {
      start: value,
    },
  };
}

export function handlePeople<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["people"],
): PeoplePropertyRequest {
  return {
    type: "people",
    people: value.map((v) => ({
      object: "user",
      id: v.id,
    })),
  };
}

export function handleFiles<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["files"],
): FilesPropertyRequest {
  return {
    type: "files",
    files: value.map((v) => ({
      name: v.name,
      external: {
        url: v.url,
      },
    })),
  };
}

export function handleUrl<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["url"],
): UrlPropertyRequest {
  return {
    type: "url",
    url: value,
  };
}

export function handleEmail<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["email"],
): EmailPropertyRequest {
  return {
    type: "email",
    email: value,
  };
}

export function handlePhoneNumber<MultiSelectEnum, SelectEnum, StatusEnum>(
  value: ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum>["phone_number"],
): PhoneNumberPropertyRequest {
  return {
    type: "phone_number",
    phone_number: value,
  };
}
