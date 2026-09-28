import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listSubmissions } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}
