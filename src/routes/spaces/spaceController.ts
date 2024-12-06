import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { spacesTable } from "@/models/spacesModel";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  getCachedResponse,
  cacheResponse,
  deleteCachedResponse,
} from "@/utils/cacheService";

type DrizzleClient = NodePgDatabase;

const CACHE_CATEGORY = "spaces";
const CACHE_TTL = 3600 * 24; // 1 day

export async function getSpaces(userId: string, c: Context, db: DrizzleClient) {
  const cached = await getCachedResponse(
    c.env.CACHE,
    CACHE_CATEGORY,
    `${userId}:all`
  );
  if (cached) {
    return c.json(cached);
  }

  const spaces = await db
    .select()
    .from(spacesTable)
    .where(eq(spacesTable.userId, userId));

  // Cache the result
  await cacheResponse(
    c.env.CACHE,
    CACHE_CATEGORY,
    `${userId}:all`,
    spaces,
    CACHE_TTL
  );

  return c.json(spaces);
}

export async function getSpace(
  id: number,
  userId: string,
  c: Context,
  db: DrizzleClient
) {
  // Try to get from cache first
  const cached = await getCachedResponse(
    c.env.CACHE,
    CACHE_CATEGORY,
    `${userId}:${id}`
  );
  if (cached) {
    return c.json(cached);
  }

  const space = await db
    .select()
    .from(spacesTable)
    .where(and(eq(spacesTable.id, id), eq(spacesTable.userId, userId)));

  if (!space || space.length === 0) {
    return c.json({ error: "Space not found" }, 404);
  }

  // Cache the result
  await cacheResponse(
    c.env.CACHE,
    CACHE_CATEGORY,
    `${userId}:${id}`,
    space[0],
    CACHE_TTL
  );

  return c.json(space[0]);
}

export async function createSpace(
  spaceData: any,
  userId: string,
  c: Context,
  db: DrizzleClient
) {
  const newSpace = await db
    .insert(spacesTable)
    .values({
      ...spaceData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Invalidate the spaces list cache
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);

  return c.json(newSpace[0]);
}

export async function updateSpace(
  id: number,
  userId: string,
  spaceData: any,
  c: Context,
  db: DrizzleClient
) {
  const updatedSpace = await db
    .update(spacesTable)
    .set({
      ...spaceData,
      updatedAt: new Date(),
    })
    .where(and(eq(spacesTable.id, id), eq(spacesTable.userId, userId)))
    .returning();

  if (!updatedSpace || updatedSpace.length === 0) {
    return c.json({ error: "Space not found" }, 404);
  }

  // Invalidate both the specific space cache and the spaces list cache
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:${id}`);
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);

  return c.json(updatedSpace[0]);
}

export async function deleteSpace(
  id: number,
  userId: string,
  c: Context,
  db: DrizzleClient
) {
  const deletedSpace = await db
    .delete(spacesTable)
    .where(and(eq(spacesTable.id, id), eq(spacesTable.userId, userId)))
    .returning();

  if (!deletedSpace || deletedSpace.length === 0) {
    return c.json({ error: "Space not found" }, 404);
  }

  // Invalidate both the specific space cache and the spaces list cache
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:${id}`);
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);

  return c.json({ success: true });
}
