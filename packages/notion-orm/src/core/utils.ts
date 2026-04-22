import path from "node:path";

export function getGeneratedDBMapping(override?: Record<string, string>) {
  const defaultPath = path.join(process.cwd(), "notion-orm.generated.ts");
  const mapping = import(defaultPath)
    .then((mod) => mod.databaseMapping as Record<string, string>)
    .catch(() => {
      console.warn(
        "Warning: Could not load database mapping from notion-orm.generated.ts. Make sure to run `notion-orm push` first.",
      );
      return {} as Record<string, string>;
    });
  return override ? Promise.resolve(override) : mapping;
}
