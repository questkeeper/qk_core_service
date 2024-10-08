import { createRoute, z } from "@hono/zod-openapi";
import { Context } from "hono";

const exampleRoute = createRoute({
  security: [{ apiKey: [] }],
  headers: {
    "x-api-key": {
      required: true,
      description: "API Key",
    },
  },
  request: {
    headers: z.object({
      "x-api-key": z.string(),
    }),
  },
  method: "get",
  path: "/test",
  summary: "Test route",
  description: "This is a test route.",
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
});

const exampleRouteHandler = async (c: Context<{}, any, {}>): Promise<any> => {
  return c.json({ message: "Hello, world!" });
};

export { exampleRoute, exampleRouteHandler };
