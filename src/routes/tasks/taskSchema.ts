import { createTaskSchema, selectTaskSchema } from "@/models/tasksModel";
import { z, createRoute } from "@hono/zod-openapi";

const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(), // ISO date string
  categoryId: z.number().optional(),
  spaceId: z.number().optional(),
  completed: z.boolean().optional(),
  starred: z.boolean().optional(),
});

// Base response codes:
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

export const createTaskRouteBaseObject: Parameters<typeof createRoute>[0] = {
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
  tags: ["Tasks"],
  request: {
    body: {
      description: "Task creation parameters",
      content: {
        "application/json": {
          schema: z.object({
            ...createTaskSchema.shape,
            userId: z.string().uuid().nullable(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Task created successfully",
      content: {
        "application/json": {
          schema: selectTaskSchema,
        },
      },
    },
    ...responseCodes,
  },
};

// Take in a method as a string and return a route object
export const updateTaskRouteBaseObject = (
  method: "patch" | "put",
  routePath: string
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
      name: "taskId",
      required: true,
      schema: {
        type: "number",
      },
    },
  ],
  method: method,
  path: routePath,
  tags: ["Tasks"],
  request: {
    body: {
      description: "Task update parameters",
      content: {
        "application/json": {
          schema: taskSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Task updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            ...taskSchema.shape,
            createdAt: z.string(),
            updatedAt: z.string(),
            userId: z.string().uuid(),
          }),
        },
      },
    },
    404: {
      description: "Task not found",
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

export const getTaskRouteBaseObject = (
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
    {
      in: "path",
      name: "taskId",
      required: true,
      schema: {
        type: "number",
      },
    },
    ...queryParameters,
  ],
  method: "get",
  path: routePath,
  tags: ["Tasks"],
  responses: {
    200: {
      description: "Task updated successfully",
      content: {
        "application/json": {
          schema: responseContent,
        },
      },
    },
    404: {
      description: "Task not found",
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
