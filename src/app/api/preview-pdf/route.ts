import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/blob-store";
import { generateSubmissionPdf } from "@/lib/pdf";
import { Submission } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Public, ephemeral PDF preview generated from whatever the visitor has
// typed so far. Nothing is persisted to storage here.
export async function POST(req: NextRequest) {
  try {
    const config = await getConfig();
    const formData = await req.formData();

    const data: Record<string, string> = {};
    const signatures: Record<string, string> = {};
    const files: Submission["files"] = {};

    for (const block of config.blocks) {
      if (block.kind !== "fieldRow") continue;
      for (const field of block.fields) {
        if (field.type === "file") {
          const entries = formData.getAll(field.name).filter(
            (v): v is File => v instanceof File && v.size > 0
          );
          if (entries.length) {
            files[field.name] = entries.map((f) => ({
              url: "",
              name: f.name,
              size: f.size,
            }));
          }
        } else if (field.type === "signature") {
          const raw = formData.get(field.name);
          if (typeof raw === "string" && raw.startsWith("data:image")) {
            // embed directly without uploading: write to a short-lived data url pass-through
            signatures[field.name] = raw;
          }
        } else {
          const raw = formData.get(field.name);
          data[field.name] = typeof raw === "string" ? raw : "";
        }
      }
    }

    const fakeSubmission: Submission = {
      id: "vista-previa",
      createdAt: new Date().toISOString(),
      data,
      files,
      signatures,
      configVersion: config.version,
    };

    const bytes = await generateSubmissionPdf(config, fakeSubmission);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="vista-previa.pdf"`,
      },
    });
  } catch (err) {
    console.error("preview-pdf error", err);
    return NextResponse.json({ error: "No se pudo generar la vista previa" }, { status: 500 });
  }
}
