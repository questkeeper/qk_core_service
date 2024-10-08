const QUALIFIED_CACHE_URL = "https://api.questkeeper.app/v1/";

export async function getCachedResponse(
  cache: Cache,
  categoryId: string,
  itemId: string
): Promise<any> {
  const cacheKey = `${QUALIFIED_CACHE_URL}::${categoryId}-${itemId}`;
  const cachedResponse = await cache.match(cacheKey); // Check if item is in cache already

  if (cachedResponse) {
    try {
      const cachedText = await cachedResponse.text();
      const cachedItem = cachedText ? JSON.parse(cachedText) : null;
      return cachedItem;
    } catch (e) {
      return null;
    }
  }

  return null;
}

export async function cacheResponse(
  cache: Cache,
  categoryId: string,
  itemId: string,
  data: any,
  cacheTTL: number = 60 * 60 // 1 hour
): Promise<void> {
  try {
    const cacheKey = `${QUALIFIED_CACHE_URL}::${categoryId}-${itemId}`;
    const cacheResponse = new Response(JSON.stringify(data));
    cacheResponse.headers.set("Cache-Control", `max-age=${cacheTTL}`);
    await cache.put(cacheKey, cacheResponse);
  } catch (e) {
    console.error(e);
  }
}

export async function deleteCachedResponse(
  cache: Cache,
  categoryId: string,
  itemId: string
): Promise<void> {
  try {
    const cacheKey = `${QUALIFIED_CACHE_URL}::${categoryId}-${itemId}`;
    await cache.delete(cacheKey);
  } catch (e) {
    console.error(e);
  }
}
