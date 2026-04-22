import { NotionTable } from "./types.js";

export class Select<T extends NotionTable, M, S> {
  constructor(
    private table: T,
    token: string,
    config?: Record<string, string>,
  ) {

    


  }
}
