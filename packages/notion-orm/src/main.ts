import { InferInsertType } from "./core/types.js";
import { type multiSelectEnum, type selectEnum, tasksTable, projectsTable } from "./schema/index.js";

const _createT = (_data: InferInsertType<typeof tasksTable, multiSelectEnum, selectEnum>) => {};
const _createP = (_data: InferInsertType<typeof projectsTable, multiSelectEnum, selectEnum>) => {};

void _createT;
void _createP;
