import { NextResponse } from "next/server";

import { normalizeAppState } from "@/lib/app-state";
import { readAppStateFile, writeAppStateFile } from "@/lib/state-file";

export async function GET() {
  const state = await readAppStateFile();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = normalizeAppState(await request.json());
  await writeAppStateFile(body);
  return NextResponse.json({ ok: true });
}
