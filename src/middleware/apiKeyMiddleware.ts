import { bearerAuth } from "hono/bearer-auth";
import { Context } from "hono";

async function apiKeyMiddleware(
  c: Context<{}, any, {}>,
  next: () => Promise<any>
) {
  const { API_KEY } = c.env as {
    API_KEY: string;
  };

  const start = Date.now();

  const bearer = bearerAuth({
    headerName: "X-API-Key",
    prefix: "",
    token: API_KEY,
  });
  await bearer(c, next);
  const end = Date.now();
  c.res.headers.set("X-Response-Time", `${end - start}`);
}

export default apiKeyMiddleware;
