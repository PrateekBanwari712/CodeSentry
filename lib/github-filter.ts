const IGNORE_PATTERNS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".env",
  ".env.",
];

export function shouldIgnoreFile(filePath: string): boolean {
  // Check extensions
  if (/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz)$/i.test(filePath)) {
    return true;
  }
  // Check directory or file pattern exclusions
  return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

// Helper to process file contents in controlled batches
export async function mapConcurrently<T, U>(
  array: T[],
  batchSize: number,
  fn: (item: T) => Promise<U>,
): Promise<U[]> {
  const results: U[] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}
