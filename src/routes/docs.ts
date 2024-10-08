import { Context } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

async function swaggerUIHandler(
  c: Context<{}, any, {}>,
  next: any
): Promise<Response> {
  const contextEnv = c.env as {
    ENVIRONMENT: string | null;
  };
  if (contextEnv.ENVIRONMENT == null || contextEnv.ENVIRONMENT !== "dev") {
    return c.text("Forbidden", 403);
  }
  return swaggerUI({ url: "/v1/template/doc" })(c, next) as any;
}

export default swaggerUIHandler;

export const docInfo = {
  info: {
    version: "v1",
  },
  security: [
    {
      apiKey: [],
    },
  ],
  openapi: "3.1.0",
};
