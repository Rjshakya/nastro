import { Hono } from "hono";
import { notionApp } from "./notion";
import { sitesApp } from "./site";
import { themeApp } from "./theme";
import { templateApp } from "./template";
import { uploadApp } from "./upload";

const api = new Hono()
  .route("/notion", notionApp)
  .route("/sites", sitesApp)
  .route("/theme", themeApp)
  .route("/template", templateApp)
  .route("/upload", uploadApp);

export { api };
