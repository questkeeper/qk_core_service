import { z, createRoute } from "@hono/zod-openapi";

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
  401: {
    description: "Unauthorized",
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

const baseRouteObject = {
  security: [{ Authorization: [] }],
  parameters: [{
    name: "Authorization",
    in: "header" as const,
    required: true,
    schema: {
      type: "string" as const,
    },
  }],
  tags: ["Auth"],
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
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
  },
};

export const deleteAccountRouteObject = createRoute({
  ...baseRouteObject,
  method: "delete",
  path: "/delete",
  description: "Permanently delete user account and all associated data",
});

export const deactivateAccountRouteObject = createRoute({
  ...baseRouteObject,
  method: "post",
  path: "/deactivate",
  description: "Temporarily deactivate user account",
});

export const reactivateAccountRouteObject = createRoute({
  ...baseRouteObject,
  method: "post",
  path: "/reactivate",
  description: "Reactivate a deactivated user account",
}); 