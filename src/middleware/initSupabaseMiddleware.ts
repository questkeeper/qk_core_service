import { Context } from "hono";
import { env } from "hono/adapter";
import { createClient } from "@supabase/supabase-js";

export default function initSupabaseMiddleware(
  c: Context<{}, any, {}>,
  next: () => Promise<any>
): Promise<any> {
  const { SUPABASE_URL, SUPABASE_KEY } = env<{
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  }>(c);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  c.set("supabase" as never, supabase);
  return next();
}
