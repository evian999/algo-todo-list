import { NextResponse } from "next/server";
import { COOKIE, COOKIE_LEGACY } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const clear = { httpOnly: true, path: "/", maxAge: 0 } as const;
  res.cookies.set(COOKIE, "", clear);
  res.cookies.set(COOKIE_LEGACY, "", clear);
  return res;
}
