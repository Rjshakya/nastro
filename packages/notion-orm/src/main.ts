import { InferInsertType } from "./core/table.js";
import { type multiSelectEnum, type selectEnum, tasksTable } from "./schema/index.js";

const createT = (data: InferInsertType<typeof tasksTable, multiSelectEnum, selectEnum>) => {};
// const createP = (data: InferInsertType<typeof projectsTable>) => {};

createT({ title: "", tags: [{ name: "Bug" }], priority: "High" });
// createP({})
  