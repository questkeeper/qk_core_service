import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleStar,
  toggleComplete,
  deleteTask,
} from "@/routes/tasks/taskController";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  createTaskRouteBaseObject,
  getTaskRouteBaseObject,
  updateTaskRouteBaseObject,
} from "@/routes/tasks/taskSchema";
import { createTaskSchema, selectTaskSchema } from "@/models/tasksModel";
import { Context } from "hono";
import { Bindings } from "@/utils/types";

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

  return await getTask(parseInt(id), userId, c, db);
}

const createTaskRoute = createRoute({
  ...createTaskRouteBaseObject,
  description: "Create a new task",
});
// Create a new task
async function createTaskHandler(c: Context) {
  const db = c.get("db");
  const userId = c.get("user").id;
  const taskData = await c.req.json();
  return await createTask(taskData, userId, c, db);
}

const updateTaskRoute = createRoute({
  ...updateTaskRouteBaseObject("/:id", "put", {
    "application/json": {
      schema: z.object({
        ...createTaskSchema.shape,
        userId: z.string().uuid().nullable(),
      }),
    },
  }),
  description: "Update a task by ID",
});
// Update a task
async function updateTaskHandler(c: Context) {
  const id = c.req.param("id");
  const taskData = await c.req.json();
  const userId = c.get("user").id;
  return await updateTask(parseInt(id), userId, taskData, c, c.get("db"));
}

const toggleCompleteRoute = createRoute({
  ...updateTaskRouteBaseObject("/:id/toggleComplete", "patch", null),
  description: "Toggle task completion status",
});
// Toggle task completion status
async function toggleCompleteHandler(c: Context) {
  const id = c.req.param("id");
  const userId = c.get("user").id;
  const db = c.get("db");
  return await toggleComplete(parseInt(id), userId, c, db);
}

const toggleStarRoute = createRoute({
  ...updateTaskRouteBaseObject("/:id/toggleStar", "patch", null),
  description: "Toggle task starred status",
});
// Toggle task starred status
async function toggleStarHandler(c: Context) {
  const id = c.req.param("id");
  const userId = (c.get("user" as never) as any).id;
  const db = c.get("db" as never);
  return await toggleStar(parseInt(id), userId, c, db);
}

// Delete a task
async function deleteTaskHandler(c: Context) {
  const id = c.req.param("id");
  const userId = (c.get("user" as never) as any).id;
  const db = c.get("db" as never);
  return await deleteTask(parseInt(id), userId, c, db);
}

export default new OpenAPIHono<{ Bindings: Bindings }>()
  .get("/", getTasksHandler)
  .get("/:id", getTaskHandler)
  .post("/", createTaskHandler)
  .put("/:id", updateTaskHandler)
  .patch("/:id/toggleComplete", toggleCompleteHandler)
  .patch("/:id/toggleStar", toggleStarHandler)
  .delete("/:id", deleteTaskHandler);
