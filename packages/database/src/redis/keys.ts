function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRedisEnvironment(): string {
  return sanitizeSegment(
    process.env.ZAYLOQ_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

export function redisKey(...segments: Array<string | number>): string {
  const normalized = segments.map((segment) =>
    sanitizeSegment(String(segment))
  );

  return [
    "zayloq",
    getRedisEnvironment(),
    ...normalized
  ].join(":");
}
