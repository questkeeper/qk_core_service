// Hono imports
import { OpenAPIHono } from "@hono/zod-openapi";

// Middleware Imports
import corsMiddleware from "@/middleware/corsMiddleware";
import { appendTrailingSlash } from "hono/trailing-slash";
import initSupabaseMiddleware from "@/middleware/initSupabaseMiddleware";
import jwtMiddleware from "@/middleware/jwtMiddleware";
import initDrizzleMiddleware from "@/middleware/initDrizzleMiddleware";

// Route Imports
import ping from "@/routes/ping";
import swaggerUIHandler from "@/routes/docs";
import tasksRoute from "@/routes/tasks/taskRoute";
import spacesRoute from "@/routes/spaces/spaceRoute";
import categoriesRoute from "@/routes/categories/categoryRoute";
import { Bindings } from "@/utils/types";
import authApi from "@/routes/auth/authRoute";

// You should edit these values to match your service
const title = "QuestKeeper Core Microservice API";
const basePath = "/v1/core"; // All routes will be prefixed with this path

// Initialize the app and set some base routes
const app = new OpenAPIHono<{ Bindings: Bindings }>()
  .basePath(basePath)
  .get("/", (c) => c.text(title))
  .route("/ping", ping)
  .use(
    corsMiddleware,
    appendTrailingSlash(),
    initSupabaseMiddleware,
    initDrizzleMiddleware,
    jwtMiddleware
  )
  .get("/ui/", swaggerUIHandler)
  .route("/tasks", tasksRoute)
  .route("/spaces", spacesRoute)
  .route("/categories", categoriesRoute)
  .route("/auth", authApi);

export default app;
export type AppType = typeof app;
