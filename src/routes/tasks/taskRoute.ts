import {
  getTasks,
  getTask,
  //   createTask,
  //   toggleStar,
  //   toggleComplete,
  //   deleteTask,
  //   updateTask,
} from "@/routes/tasks/taskController";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  createTaskRouteBaseObject,
  getTaskRouteBaseObject,
  updateTaskRouteBaseObject,
} from "@/routes/tasks/taskSchema";
import { selectTaskSchema } from "@/models/tasksModel";
import { Context } from "hono";

const tasksRoute = new OpenAPIHono();

const getTasksRoute = createRoute({
  ...getTaskRouteBaseObject(
    "/",
    // Optional query parameter
    [
      {
        in: "query",
        name: "isCompleted",
        schema: z.boolean().optional(),
      },
    ],
    z.array(selectTaskSchema)
  ),
  description: "Get all tasks, optionally filtered by completion status",
});

// Get all tasks, optionally filtered by completion status
async function getTasksHandler(c: Context) {
  const isCompleted = c.req.query("isCompleted") === "true"; // Parse query param
  const db = c.get("db");
  const userId = c.get("user").id;
  const cache = caches.default;

  return await getTasks(isCompleted, userId, c, db);
}

const getTaskRoute = createRoute({
  ...getTaskRouteBaseObject("/:id", [], selectTaskSchema),
  description: "Get a single task by ID",
});
// Get a single task by ID
async function getTaskHandler(c: Context) {
  const id = c.req.param("id");
  const db = c.get("db");
  const userId = c.get("user").id;
  const cache = caches.default;

  return await getTask(parseInt(id), userId, c, db);
}

// Create a new task
// tasksRoute.post("/", async (c) => {
//   const taskData = await c.req.json();
//   return await createTask(taskData);
// });

// // Update a task
// tasksRoute.put("/:id", async (c) => {
//   const id = c.req.param("id");
//   const taskData = await c.req.json();
//   return await updateTask(parseInt(id), taskData);
// });

// // Toggle task completion status
// tasksRoute.put("/:id/toggleComplete", async (c) => {
//   const id = c.req.param("id");
//   return await toggleComplete(parseInt(id));
// });

// // Toggle task starred status
// tasksRoute.put("/:id/toggleStar", async (c) => {
//   const id = c.req.param("id");
//   return await toggleStar(parseInt(id));
// });

// // Delete a task
// tasksRoute.delete("/:id", async (c) => {
//   const id = c.req.param("id");
//   return await deleteTask(parseInt(id));
// });

tasksRoute.openapi(getTasksRoute, getTasksHandler);
tasksRoute.openapi(getTaskRoute, getTaskHandler);

export default tasksRoute;
