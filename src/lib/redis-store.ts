import { Redis } from "@upstash/redis";
import type { AppData } from "./types";
import { parseAppData } from "./validate";

function client(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

const key = (userId: string) => `algo-todo:v1:${userId}`;

export async function loadFromRedis(userId: string): Promise<AppData | null> {
  const r = client();
  if (!r) return null;
  const raw = await r.get(key(userId));
  if (raw == null) return null;
  const str = typeof raw === "string" ? raw : JSON.stringify(raw);
  return parseAppData(JSON.parse(str));
}

export async function saveToRedis(userId: string, data: AppData): Promise<void> {
  const r = client();
  if (!r) throw new Error("Redis not configured");
  await r.set(key(userId), JSON.stringify(data));
}
