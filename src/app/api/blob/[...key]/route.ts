import { NextRequest, NextResponse } from "next/server";
import { getBlobBytes } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

// Serves files, signatures and the logo that were stored in Netlify Blobs by
// uploadFile()/uploadDataUrl(). The key is unguessable (random suffix), so
// this is safe to leave public — same trade-off as the old Vercel Blob URLs.
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  const key = params.key.map((p) => decodeURIComponent(p)).join("/");
  const result = await getBlobBytes(key);
  if (!result) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return new NextResponse(Buffer.from(result.bytes), {
    headers: {
      "Content-Type": result.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
