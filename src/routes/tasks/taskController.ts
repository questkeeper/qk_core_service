import {
  selectTasksArraySchema,
  selectTaskSchema,
  createTaskSchema,
  tasksTable,
} from "@/models/tasksModel";
import {
  cacheResponse,
  deleteCachedResponse,
  getCachedResponse,
} from "@/utils/cacheService";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Context } from "hono";

export async function getTasks(
  isCompleted: boolean,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) {
  const cache = caches.default;

  const cachedResponse = await getCachedResponse(
    cache,
    `tasks-${isCompleted}`,
    userId
  );

  if (cachedResponse) {
    return c.json(cachedResponse);
  }

  const tasks = selectTasksArraySchema.parse(
    await db
      .select()
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.completed, isCompleted),
          eq(tasksTable.userId, userId)
        )
      )
      .limit(100)
  );

  await cacheResponse(cache, `tasks-${isCompleted}`, userId, tasks);

  return c.json(tasks);
}

export const getTask = async (
  id: number,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) => {
  const cache = caches.default;
  const cachedIncompleteTasks = await getCachedResponse(
    cache,
    `tasks-${false}`,
    userId
  );

  let task = cachedIncompleteTasks
    ? cachedIncompleteTasks.find((t: any) => t.id === id)
    : null;

  if (task) {
    return c.json(task);
  }

  const cachedCompleteTasks = await getCachedResponse(
    cache,
    `tasks-${true}`,
    userId
  );

  task = cachedCompleteTasks
    ? cachedCompleteTasks.find((t: any) => t.id === id)
    : null;

  if (task) {
    return c.json(task);
  }

  // Fetch from DB
  task = selectTaskSchema.parse(
    await db
      .select()
      .from(tasksTable)
      .where(
        and(eq(tasksTable.completed, false), eq(tasksTable.userId, userId))
      )
  );

  if (!task) {
    c.status(404);
    return c.json({ message: "Task not found" });
  }

  return c.json(task);
};

export const createTask = async (
  task: any,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) => {
  const currentUtcDate = new Date(new Date().toUTCString());
  const parsedTask = createTaskSchema.parse({
    ...task,
    userId,
    createdAt: currentUtcDate,
    updatedAt: currentUtcDate,
  });
  const result = selectTaskSchema.parse(
    (await db.insert(tasksTable).values(parsedTask).returning())[0]
  );

  if (!result) {
    c.status(500);
    return c.json({ message: "Task creation failed" });
  }

  const cache = caches.default;
  await deleteCachedResponse(cache, `tasks-${false}`, userId);

  return c.json(result);
};

export const updateTask = async (
  id: number,
  userId: string,
  task: any,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) => {
  return await updateAsyncTask(id, userId, c, db, task);
};

export const toggleStar = async (
  id: number,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) => await updateAsyncTask(id, userId, c, db, null, UpdateTaskType.Star);

export const toggleComplete = async (
  id: number,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) => await updateAsyncTask(id, userId, c, db, null, UpdateTaskType.Complete);

export const deleteTask = async (
  id: number,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>
) => {
  try {
    await db
      .delete(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));

    const cache = caches.default;
    await deleteCachedResponse(cache, `tasks-${false}`, userId);
    await deleteCachedResponse(cache, `tasks-${true}`, userId);

    return c.json({ message: "Task deleted successfully" });
  } catch (e) {
    return c.json({ message: "Task deletion failed" }, 500);
  }
};

// Helper function to update the task
export async function updateAsyncTask(
  id: number,
  userId: string,
  c: Context,
  db: NodePgDatabase<Record<string, never>>,
  task?: any,
  type?: UpdateTaskType
) {
  if (!task) {
    task = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));

    if (task.length === 0) {
      c.status(404);
      return c.json({ message: "Task not found" });
    }

    task = task[0];
  } else {
    task = createTaskSchema.parse(task);
  }

  if (type === UpdateTaskType.Complete) {
    task.completed = !task.completed;
  } else if (type === UpdateTaskType.Star) {
    task.starred = !task.starred;
  }

  const updatedTask = await db
    .update(tasksTable)
    .set({ ...task, updatedAt: new Date(new Date().toUTCString()) })
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .returning();

  if (!updatedTask) {
    c.status(500);
    return c.json({ message: "Task update failed" });
  }

  const cache = caches.default;
  await deleteCachedResponse(cache, `tasks-${false}`, userId);
  await deleteCachedResponse(cache, `tasks-${true}`, userId);

  return c.json(updatedTask, 200);
}

enum UpdateTaskType {
  Complete,
  Star,
}
