import { drizzle } from "drizzle-orm/postgres-js";
import { Context } from "hono";
import postgres from "postgres";

export default async function initDrizzleMiddleware(
  c: Context<{}, any, {}>,
  next: () => Promise<any>
) {
  const { DB_CONNECTION_STRING } = c.env as { DB_CONNECTION_STRING: string };
  const client = postgres(DB_CONNECTION_STRING, { prepare: false });

  const db = drizzle(client);

  c.set("db" as never, db);
  return next();
}
