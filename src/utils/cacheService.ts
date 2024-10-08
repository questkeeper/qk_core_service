import { Context } from "hono";

export async function getCachedResponse(
  c: Context<{}, any, {}>,
  cache: Cache,
  categoryId: string,
  itemId: string
): Promise<any> {
  const cacheKey = `${c.req.url}::${categoryId}-${itemId}`;
  const cachedResponse = await cache.match(cacheKey); // Check if item is in cache already

  if (cachedResponse) {
    const cachedItem = await cachedResponse.json();
    return cachedItem;
  }

  return null;
}

export async function cacheResponse(
  c: Context<{}, any, {}>,
  cache: Cache,
  categoryId: string,
  itemId: string,
  data: any,
  cacheTTL: number = 60 * 60 // 1 hour
): Promise<void> {
  const cacheKey = `${c.req.url}::${categoryId}-${itemId}`;
  const cacheResponse = new Response(JSON.stringify(data.user));
  cacheResponse.headers.set("Cache-Control", `max-age=${cacheTTL}`);
  await cache.put(cacheKey, cacheResponse);
}
