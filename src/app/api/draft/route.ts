import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put, head } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" && body.token ? body.token : randomUUID();
    const payload = {
      token,
      updatedAt: new Date().toISOString(),
      data: body.data || {},
    };
    await put(`drafts/${token}.json`, JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return NextResponse.json({ ok: true, token });
  } catch (err) {
    return NextResponse.json({ error: "No se pudo guardar el borrador" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 400 });
  }
  try {
    const info = await head(`drafts/${token}.json`).catch(() => null);
    if (!info) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const res = await fetch(info.url, { cache: "no-store" });
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
