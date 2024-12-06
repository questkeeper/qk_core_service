import { Context } from "hono";
import { eq } from "drizzle-orm";
import { categoriesTable } from "@/models/categoriesModel";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and } from "drizzle-orm";
import { getCachedResponse, cacheResponse, deleteCachedResponse } from "@/utils/cacheService";

type DrizzleClient = NodePgDatabase;

const CACHE_CATEGORY = "categories";
const CACHE_TTL = 3600; // 1 hour

export async function getCategories(userId: string, c: Context, db: DrizzleClient) {
  // Try to get from cache first
  const cached = await getCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);
  if (cached) {
    return c.json(cached);
  }

  const categories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.userId, userId));

  // Cache the result
  await cacheResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`, categories, CACHE_TTL);

  return c.json(categories);
}

export async function getCategory(id: number, userId: string, c: Context, db: DrizzleClient) {
  // Try to get from cache first
  const cached = await getCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:${id}`);
  if (cached) {
    return c.json(cached);
  }

  const category = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)));

  if (!category || category.length === 0) {
    return c.json({ error: "Category not found" }, 404);
  }

  // Cache the result
  await cacheResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:${id}`, category[0], CACHE_TTL);

  return c.json(category[0]);
}

export async function createCategory(categoryData: any, userId: string, c: Context, db: DrizzleClient) {
  const newCategory = await db
    .insert(categoriesTable)
    .values({
      ...categoryData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Invalidate the categories list cache
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);

  return c.json(newCategory[0]);
}

export async function updateCategory(
  id: number,
  userId: string,
  categoryData: any,
  c: Context,
  db: DrizzleClient
) {
  const updatedCategory = await db
    .update(categoriesTable)
    .set({
      ...categoryData,
      updatedAt: new Date(),
    })
    .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)))
    .returning();

  if (!updatedCategory || updatedCategory.length === 0) {
    return c.json({ error: "Category not found" }, 404);
  }

  // Invalidate both the specific category cache and the categories list cache
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:${id}`);
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);

  return c.json(updatedCategory[0]);
}

export async function deleteCategory(id: number, userId: string, c: Context, db: DrizzleClient) {
  const deletedCategory = await db
    .delete(categoriesTable)
    .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)))
    .returning();

  if (!deletedCategory || deletedCategory.length === 0) {
    return c.json({ error: "Category not found" }, 404);
  }

  // Invalidate both the specific category cache and the categories list cache
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:${id}`);
  await deleteCachedResponse(c.env.CACHE, CACHE_CATEGORY, `${userId}:all`);

  return c.json({ success: true });
}
