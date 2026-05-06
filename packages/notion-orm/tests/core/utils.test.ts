import { describe, it, expect } from "vitest";
import { getGeneratedDBMapping } from "../../src/core/utils.js";
import path from "node:path";

describe("getGeneratedDBMapping", () => {
  it("returns override immediately when provided", async () => {
    const override = { Users: "override-id" };
    const result = await getGeneratedDBMapping(override);
    expect(result).toEqual(override);
  });

  it("returns mapping when notion-orm.generated.ts exists at process.cwd()", async () => {
    const result = await getGeneratedDBMapping();
    expect(result).toEqual({
      Users: "dbid-users-123",
      Posts: "dbid-posts-456",
    });
  });
});
