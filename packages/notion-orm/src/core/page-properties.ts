import type {
  CheckboxPropertyRequest,
  Column,
  ColumnTypeMap,
  DatePropertyRequest,
  EmailPropertyRequest,
  FilesPropertyRequest,
  InferInsertType,
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

export function convertToPageProperties<T extends NotionTable, M, S>(
  data: InferInsertType<T, M, S>,
  table: T,
): NotionPagePropertyRequest {
  const props = Object.entries(data).reduce((acc, curr) => {
    const [name, value] = curr;
    const col = table["properties"][name];

    if (isReadOnlyColumn(col)) return acc;

    switch (col.type) {
      case "title":
        acc[name] = handleTitle(value as ColumnTypeMap<M, S>["title"]);
        break;
      case "checkbox":
        acc[name] = handleCheckbox(value as ColumnTypeMap<M, S>["checkbox"]);
        break;
      case "rich_text":
        acc[name] = handleRichText(value as ColumnTypeMap<M, S>["rich_text"]);
        break;
      case "number":
        acc[name] = handleNumber(value as ColumnTypeMap<M, S>["number"]);
        break;
      case "select":
        acc[name] = handleSelect(value as ColumnTypeMap<M, S>["select"]);
        break;
      case "multi_select":
        acc[name] = handleMultiSelect(value as ColumnTypeMap<M, S>["multi_select"]);
        break;
      case "status":
        acc[name] = handleStatus(value as ColumnTypeMap<M, S>["status"]);
        break;
      case "date":
        acc[name] = handleDate(value as ColumnTypeMap<M, S>["date"]);
        break;
      case "people":
        acc[name] = handlePeople(value as ColumnTypeMap<M, S>["people"]);
        break;
      case "files":
        acc[name] = handleFiles(value as ColumnTypeMap<M, S>["files"]);
        break;
      case "url":
        acc[name] = handleUrl(value as ColumnTypeMap<M, S>["url"]);
        break;
      case "email":
        acc[name] = handleEmail(value as ColumnTypeMap<M, S>["email"]);
        break;
      case "phone_number":
        acc[name] = handlePhoneNumber(value as ColumnTypeMap<M, S>["phone_number"]);
        break;
    }

    return acc;
  }, {} as NotionPagePropertyRequest);

  return props;
}

export function handleTitle<M, S>(value: ColumnTypeMap<M, S>["title"]): TitlePropertyRequest {
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

export function handleCheckbox<M, S>(
  value: ColumnTypeMap<M, S>["checkbox"],
): CheckboxPropertyRequest {
  return {
    type: "checkbox",
    checkbox: value,
  };
}

export function handleRichText<M, S>(
  value: ColumnTypeMap<M, S>["rich_text"],
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

export function handleNumber<M, S>(value: ColumnTypeMap<M, S>["number"]): NumberPropertyRequest {
  return {
    type: "number",
    number: value,
  };
}

export function handleSelect<M, S>(value: ColumnTypeMap<M, S>["select"]): SelectPropertyRequest {
  return {
    type: "select",
    select: {
      name: value as string,
    },
  };
}

export function handleMultiSelect<M, S>(
  value: ColumnTypeMap<M, S>["multi_select"],
): MultiSelectPropertyRequest {
  return {
    type: "multi_select",
    multi_select: value.map((v) => ({ name: v.name as string })),
  };
}

export function handleStatus<M, S>(value: ColumnTypeMap<M, S>["status"]): StatusPropertyRequest {
  return {
    type: "status",
    status: {
      name: value,
    },
  };
}

export function handleDate<M, S>(value: ColumnTypeMap<M, S>["date"]): DatePropertyRequest {
  return {
    type: "date",
    date: {
      start: value,
    },
  };
}

export function handlePeople<M, S>(value: ColumnTypeMap<M, S>["people"]): PeoplePropertyRequest {
  return {
    type: "people",
    people: value.map((v) => ({
      object: "user",
      id: v.id,
    })),
  };
}

export function handleFiles<M, S>(value: ColumnTypeMap<M, S>["files"]): FilesPropertyRequest {
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

export function handleUrl<M, S>(value: ColumnTypeMap<M, S>["url"]): UrlPropertyRequest {
  return {
    type: "url",
    url: value,
  };
}

export function handleEmail<M, S>(value: ColumnTypeMap<M, S>["email"]): EmailPropertyRequest {
  return {
    type: "email",
    email: value,
  };
}

export function handlePhoneNumber<M, S>(
  value: ColumnTypeMap<M, S>["phone_number"],
): PhoneNumberPropertyRequest {
  return {
    type: "phone_number",
    phone_number: value,
  };
}
