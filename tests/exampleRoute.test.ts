import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { exampleRoute, exampleRouteHandler } from "@/routes/exampleRoute";
import corsMiddleware from "@/middleware/corsMiddleware";
import apiKeyMiddleware from "@/middleware/apiKeyMiddleware";
import initSupabaseMiddleware from "@/middleware/initSupabaseMiddleware";

const MOCK_ENV = {
  SUPABASE_URL: "https://your.supabase.url",
  SUPABASE_KEY: "your-anon-key",
  API_KEY: "valid-api-key",
};

describe("Example Route", () => {
  // Mock environment variables
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://your.supabase.url");
    vi.stubEnv("SUPABASE_ANON_KEY", "your-anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const app = new OpenAPIHono();

  // Apply middleware
  app.use("*", corsMiddleware);
  app.use("*", apiKeyMiddleware);
  app.use("*", initSupabaseMiddleware);

  // Register the route
  app.openapi(exampleRoute, exampleRouteHandler);

  it("should return 200 and correct message with valid API key", async () => {
    const res = await app.request(
      "/test",
      {
        method: "GET",
        headers: {
          "x-api-key": "valid-api-key",
        },
      },
      MOCK_ENV
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ message: "Hello, world!" });
  });

  it("should return 400 with invalid or missing API key", async () => {
    const resNoKey = await app.request(
      "/test",
      {
        method: "GET",
      },
      MOCK_ENV
    );
    expect(resNoKey.status).toBe(401);

    const resInvalidKey = await app.request(
      "/test",
      {
        method: "GET",
        headers: {
          "x-api-key": "invalid-api-key",
        },
      },
      MOCK_ENV
    );
    expect(resInvalidKey.status).toBe(401);
  });
});
