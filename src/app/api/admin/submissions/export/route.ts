import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listSubmissions, getConfig } from "@/lib/blob-store";
import { submissionsToCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const [config, submissions] = await Promise.all([
    getConfig(),
    listSubmissions(),
  ]);
  const csv = submissionsToCsv(config, submissions);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="envios-${Date.now()}.csv"`,
    },
  });
}
