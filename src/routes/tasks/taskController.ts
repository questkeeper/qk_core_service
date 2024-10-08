import {
  selectTasksArraySchema,
  selectTaskSchema,
  tasksTable,
} from "@/models/tasksModel";
import { cacheResponse, getCachedResponse } from "@/utils/cacheService";
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

// export const createTask = async (task: any) => {
//   const { error, data } = await supabase.from("tasks").insert([task]).select();

//   if (error) {
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//     });
//   }

//   return new Response(JSON.stringify(data), { status: 201 });
// };

// export const updateTask = async (id: number, task: any) => {
//   const { data, error } = await supabase
//     .from("tasks")
//     .update(task)
//     .eq("id", id);

//   if (error) {
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//     });
//   }

//   return new Response(JSON.stringify(data), { status: 200 });
// };

// export const toggleStar = async (id: number) => {
//   const { data, error } = await supabase
//     .from("tasks")
//     .update({ starred: true }) // Assuming this toggles star
//     .eq("id", id);

//   if (error) {
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//     });
//   }

//   return new Response(
//     JSON.stringify({ message: "Task starred successfully" }),
//     { status: 200 }
//   );
// };

// export const toggleComplete = async (id: number) => {
//   const { data, error } = await supabase
//     .from("tasks")
//     .update({ completed: true }) // Assuming this toggles completion
//     .eq("id", id);

//   if (error) {
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//     });
//   }

//   return new Response(
//     JSON.stringify({ message: "Task completed successfully" }),
//     { status: 200 }
//   );
// };

// export const deleteTask = async (id: number) => {
//   const { data, error } = await supabase.from("tasks").delete().eq("id", id);

//   if (error) {
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//     });
//   }

//   return new Response(
//     JSON.stringify({ message: `Task deleted successfully` }),
//     { status: 200 }
//   );
// };
