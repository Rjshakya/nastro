import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/node-postgres";
export const getDB = async () => drizzle(env.DATABASE_URL);
