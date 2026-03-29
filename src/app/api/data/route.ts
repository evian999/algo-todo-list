import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isRedisConfigured,
  loadFromRedis,
  saveToRedis,
} from "@/lib/redis-store";
import { getMemoryStore, setMemoryStore } from "@/lib/memory-store";
import { COOKIE, verifySessionToken } from "@/lib/session";
import { parseAppData } from "@/lib/validate";

const STORE_LEGACY = join(process.cwd(), "data", "store.json");

function userStorePath(userId: string) {
  return join(process.cwd(), "data", "stores", `${userId}.json`);
}

async function getUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { sub } = await verifySessionToken(token);
    return sub;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isRedisConfigured()) {
      const fromRedis = await loadFromRedis(userId);
      if (fromRedis) {
        setMemoryStore(fromRedis);
        return NextResponse.json(fromRedis);
      }
    }

    await mkdir(join(process.cwd(), "data", "stores"), { recursive: true });
    try {
      const buf = await readFile(userStorePath(userId), "utf-8");
      const data = parseAppData(JSON.parse(buf));
      setMemoryStore(data);
      return NextResponse.json(data);
    } catch {
      /* no per-user file */
    }

    try {
      const buf = await readFile(STORE_LEGACY, "utf-8");
      const data = parseAppData(JSON.parse(buf));
      setMemoryStore(data);
      return NextResponse.json(data);
    } catch {
      /* no legacy file */
    }

    return NextResponse.json(getMemoryStore());
  } catch {
    return NextResponse.json(getMemoryStore());
  }
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const data = parseAppData(body);
    setMemoryStore(data);

    if (isRedisConfigured()) {
      try {
        await saveToRedis(userId, data);
      } catch (e) {
        console.error("[api/data] Redis save failed:", e);
        return NextResponse.json(
          { ok: false, error: "持久化失败（请检查 Redis 配置）" },
          { status: 503 },
        );
      }
    }

    try {
      await mkdir(join(process.cwd(), "data", "stores"), { recursive: true });
      await writeFile(
        userStorePath(userId),
        JSON.stringify(data, null, 2),
        "utf-8",
      );
    } catch {
      /* Vercel 等环境无持久磁盘，依赖 Redis */
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
