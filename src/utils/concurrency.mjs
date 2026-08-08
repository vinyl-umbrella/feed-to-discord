/**
 * Map over items with a bounded number of in-flight tasks.
 * Rejections are contained per item, like Promise.allSettled.
 * @param {Array} items
 * @param {number} limit
 * @param {(item: any) => Promise<any>} fn
 * @returns {Promise<Array<{status: string, value?: any, reason?: any}>>}
 */
export async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { status: "fulfilled", value: await fn(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
}
