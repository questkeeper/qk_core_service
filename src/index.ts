// Hono imports
import { OpenAPIHono } from "@hono/zod-openapi";

// Middleware Imports
import apiKeyMiddleware from "@/middleware/apiKeyMiddleware";
import corsMiddleware from "@/middleware/corsMiddleware";
import { appendTrailingSlash } from "hono/trailing-slash";
import initSupabaseMiddleware from "@/middleware/initSupabaseMiddleware";
import jwtMiddleware from "./middleware/jwtMiddleware";
import initDrizzleMiddleware from "./middleware/initDrizzleMiddleware";

// Route Imports
import ping from "@/routes/ping";
import swaggerUIHandler, { docInfo } from "@/routes/docs";
import { exampleRoute, exampleRouteHandler } from "@/routes/exampleRoute";

// You should edit these values to match your service
const title = "QuestKeeper Template Microservice API";
const basePath = "/v1/template"; // All routes will be prefixed with this path

// Initialize the app and set some base routes
const app: OpenAPIHono = new OpenAPIHono().basePath(basePath);
app.get("/", (c) => c.text("Questkeeper Microservice template."));
app.route("/ping", ping); // Used for testing if the service is up

// Set up the swagger UI and documentation
app.get("/ui/", swaggerUIHandler);
app.doc("/doc", {
  ...docInfo,
  info: { title, ...docInfo.info },
  security: [{ apiKey: [] }],
});

/**
 * Set up middleware and base path
 *
 * By default, cors, trailingSlash, apiKey, and initSupabase middleware are included.
 * Parts like initSupabase and apiKey middleware CAN be removed/commented out if not needed.
 *
 * If you need to add more middleware, you can add them to the middleware array, and they will be applied in order.
 */
const middleware: any = [
  corsMiddleware,
  appendTrailingSlash(),
  apiKeyMiddleware,
  initSupabaseMiddleware, // Initialize Supabase
  // jwtMiddleware, // Uncomment this line to enable JWT middleware, necessary for client-facing services. API-Key should be used for internal services.
  initDrizzleMiddleware
];
middleware.forEach((m: any) => app.use(m));

/**
 *
 * Append your routes here.
 * These routes should be defined in the routes folder.
 * Depending on the type of route, you may have a folder, or a single file in the routes folder.
 *
 * Example:
 * /ping -> @/routes/ping.ts
 * /notification -> @/routes/notification/index.ts
 * /notification/send -> @/routes/notification/send.ts
 *
 * Routes should be defined using the OpenAPIHono class.
 * Example:
 * app.route("/ping", ping);
 *
 * Take a look at the example and ping routes for an example of how to define a route.
 *
 */
app.openapi(exampleRoute, exampleRouteHandler); // Implements actual openapi standards... Should probably comment/delete this out.

export default app;
