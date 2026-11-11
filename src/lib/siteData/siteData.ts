import "server-only";

/** Loads part of a page's content. If the backend is down the page still opens, just without that part. */
export async function orEmpty<T>(load: Promise<T>, empty: T): Promise<T> {
  try {
    return await load;
  } catch {
    return empty;
  }
}
