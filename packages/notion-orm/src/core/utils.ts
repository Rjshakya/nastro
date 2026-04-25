import path from "node:path";
import { pathToFileURL } from "node:url";

export function getGeneratedDBMapping(override?: Record<string, string>) {
  const defaultPath = path.join(process.cwd(), "notion-orm.generated.ts");
  const fileUrl = pathToFileURL(defaultPath).href;
  const mapping = import(fileUrl)
    .then((mod) => {
      console.log("module", mod);
      return mod.databaseMapping as Record<string, string>;
    })
    .catch((e) => {
      console.error(e);
      console.warn(
        "Warning: Could not load database mapping from notion-orm.generated.ts. Make sure to run `notion-orm push` first.",
      );
      return {} as Record<string, string>;
    });
  return override ? Promise.resolve(override) : mapping;
}
