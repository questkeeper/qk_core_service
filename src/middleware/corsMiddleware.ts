import { cors } from "hono/cors";

const corsMiddleware = cors({
  origin: ["*"],
  allowMethods: ["POST", "GET"],
  allowHeaders: ["Content-Type", "Authorization", "X-API-KEY", "X-CLIENT-INFO"],
});

export default corsMiddleware;
