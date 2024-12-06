import { selectSpaceSchema } from "@/models/spacesModel";
import { z, createRoute } from "@hono/zod-openapi";

const spaceSchema = z.object({
  title: z.string(),
  color: z.string().optional(),
});

// Base response codes
const responseCodes = {
  400: {
    description: "Invalid request",
    content: {
      "application/json": {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
  500: {
    description: "Server error",
    content: {
      "application/json": {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
};

export const createSpaceRouteBaseObject: Parameters<typeof createRoute>[0] = {
  security: [{ Authorization: [] }],
  parameters: [
    {
      in: "header",
      name: "Authorization",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  method: "post",
  path: "/",
  tags: ["Spaces"],
  request: {
    body: {
      description: "Space creation parameters",
      content: {
        "application/json": {
          schema: spaceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Space created successfully",
      content: {
        "application/json": {
          schema: selectSpaceSchema,
        },
      },
    },
    ...responseCodes,
  },
};

export const updateSpaceRouteBaseObject = (
  routePath: string,
  method: "patch" | "put",
  responseContent: any
): Parameters<typeof createRoute>[0] => ({
  security: [{ Authorization: [] }],
  parameters: [
    {
      in: "header",
      name: "Authorization",
      required: true,
      schema: {
        type: "string",
      },
    },
    {
      in: "path",
      name: "id",
      required: true,
      schema: {
        type: "number",
      },
    },
  ],
  method: method,
  path: routePath,
  tags: ["Spaces"],
  request: {
    body: {
      description: "Space update parameters",
      content: responseContent,
    },
  },
  responses: {
    200: {
      description: "Space updated successfully",
      content: {
        "application/json": {
          schema: selectSpaceSchema,
        },
      },
    },
    404: {
      description: "Space not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    ...responseCodes,
  },
});

export const getSpaceRouteBaseObject = (
  routePath: string,
  queryParameters: Array<any>,
  responseContent: any
): Parameters<typeof createRoute>[0] => ({
  security: [{ Authorization: [] }],
  parameters: [
    {
      in: "header",
      name: "Authorization",
      required: true,
      schema: {
        type: "string",
      },
    },
    ...queryParameters,
  ],
  method: "get",
  path: routePath,
  tags: ["Spaces"],
  responses: {
    200: {
      description: "Space retrieved successfully",
      content: {
        "application/json": {
          schema: responseContent,
        },
      },
    },
    404: {
      description: "Space not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    ...responseCodes,
  },
}); 