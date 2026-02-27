import { Hono } from "hono";
import { notionApp } from "./notion";
import { sitesApp } from "./sites";

const api = new Hono().route("/notion", notionApp).route("/sites", sitesApp)

export { api };
