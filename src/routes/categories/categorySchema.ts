import { selectCategoriesSchema } from "@/models/categoriesModel";
import { z, createRoute } from "@hono/zod-openapi";

const categorySchema = z.object({
  title: z.string(),
  color: z.string().optional(),
  archived: z.boolean().optional(),
  spaceId: z.number().optional(),
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

export const createCategoryRouteBaseObject: Parameters<typeof createRoute>[0] = {
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
  tags: ["Categories"],
  request: {
    body: {
      description: "Category creation parameters",
      content: {
        "application/json": {
          schema: categorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Category created successfully",
      content: {
        "application/json": {
          schema: selectCategoriesSchema,
        },
      },
    },
    ...responseCodes,
  },
};

export const updateCategoryRouteBaseObject = (
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
  tags: ["Categories"],
  request: {
    body: {
      description: "Category update parameters",
      content: responseContent,
    },
  },
  responses: {
    200: {
      description: "Category updated successfully",
      content: {
        "application/json": {
          schema: selectCategoriesSchema,
        },
      },
    },
    404: {
      description: "Category not found",
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

export const getCategoryRouteBaseObject = (
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
  tags: ["Categories"],
  responses: {
    200: {
      description: "Category retrieved successfully",
      content: {
        "application/json": {
          schema: responseContent,
        },
      },
    },
    404: {
      description: "Category not found",
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