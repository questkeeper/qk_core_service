// Hono imports
import { OpenAPIHono } from "@hono/zod-openapi";

// Middleware Imports
import corsMiddleware from "@/middleware/corsMiddleware";
import { appendTrailingSlash } from "hono/trailing-slash";
import initSupabaseMiddleware from "@/middleware/initSupabaseMiddleware";
import jwtMiddleware from "./middleware/jwtMiddleware";
import initDrizzleMiddleware from "./middleware/initDrizzleMiddleware";

// Route Imports
import ping from "@/routes/ping";
import tasksRoute from "./routes/tasks/taskRoute";
import { Bindings } from "./utils/types";

// You should edit these values to match your service
const title = "Core microservice that handles tasks, spaces, and categories";
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
    jwtMiddleware,
    initDrizzleMiddleware
  )
  .route("/tasks", tasksRoute);

export default app;
export type AppType = typeof app;
