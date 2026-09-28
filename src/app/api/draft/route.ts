import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";

export const dynamic = "force-dynamic";

const draftStore = () => getStore("captacion-form");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token =
      typeof body.token === "string" && body.token ? body.token : randomUUID();
    const payload = {
      token,
      updatedAt: new Date().toISOString(),
      data: body.data || {},
    };
    await draftStore().setJSON(`drafts/${token}.json`, payload);
    return NextResponse.json({ ok: true, token });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo guardar el borrador" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 400 });
  }
  try {
    const json = await draftStore().get(`drafts/${token}.json`, {
      type: "json",
    });
    if (!json) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
