import { Hono } from "hono";
import { notionApp } from "./notion";
import { sitesApp } from "./site";
import { themeApp } from "./theme";
import { templateApp } from "./template";

const api = new Hono()
  .route("/notion", notionApp)
  .route("/site", sitesApp)
  .route("/theme", themeApp)
  .route("/template", templateApp);

export { api };
