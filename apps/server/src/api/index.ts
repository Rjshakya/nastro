import { Hono } from "hono";
import { analyticsApp } from "./analytics";
import { apikeyApp } from "./apikey";
import { customDomainApp } from "./custom-domain";
import { notionApp } from "./notion";
import { sitesApp } from "./site";
import { themeApp } from "./theme";
import { templateApp } from "./template";
import { uploadApp } from "./upload";

const api = new Hono()
  .route("/notion", notionApp)
  .route("/site", sitesApp)
  .route("/theme", themeApp)
  .route("/template", templateApp)
  .route("/upload", uploadApp)
  .route("/apikey", apikeyApp)
  .route("/custom-domain", customDomainApp)
  .route("/analytics", analyticsApp);

export { api };
