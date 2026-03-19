import { Hono } from "hono";
import { notionApp } from "./notion";
import { sitesApp } from "./site";

const api = new Hono().route("/notion", notionApp).route("/site", sitesApp);

export { api };
