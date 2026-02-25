import { Hono } from "hono";
import { notionApp } from "./notion";

const api = new Hono().route("/notion", notionApp);

export { api };
