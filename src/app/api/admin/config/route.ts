import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getConfig, saveConfig } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const config = await getConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json();
  const current = await getConfig();
  const updated = {
    ...body,
    version: (current.version || 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  await saveConfig(updated);
  return NextResponse.json(updated);
}
