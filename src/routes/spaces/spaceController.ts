import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { selectSpacesArraySchema, spacesTable } from "@/models/spacesModel";
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
    caches.default,
    `${CACHE_CATEGORY}:all`,
    userId
  );
  if (cached) {
    return c.json(cached);
  }

  const spaces = selectSpacesArraySchema.parse(
    await db.select().from(spacesTable).where(eq(spacesTable.userId, userId))
  );

  // Cache the result
  await cacheResponse(
    caches.default,
    `${CACHE_CATEGORY}:all`,
    userId,
    spaces,
    CACHE_TTL
  );

  return c.json(spaces);
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
  await deleteCachedResponse(caches.default, `${CACHE_CATEGORY}:all`, userId);

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
  await deleteCachedResponse(caches.default, `${CACHE_CATEGORY}:all`, userId);

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
  await deleteCachedResponse(caches.default, `${CACHE_CATEGORY}:all`, userId);

  return c.json({ success: true });
}
