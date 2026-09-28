import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getConfig, saveSubmission, uploadFile, uploadDataUrl } from "@/lib/blob-store";
import { Submission, SubmissionFile } from "@/lib/types";
import { sendNotificationEmail } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const config = await getConfig();
    const formData = await req.formData();
    const id = randomUUID();

    const data: Record<string, string> = {};
    const files: Record<string, SubmissionFile[]> = {};
    const signatures: Record<string, string> = {};
    const missingRequired: string[] = [];

    for (const block of config.blocks) {
      if (block.kind !== "fieldRow") continue;
      for (const field of block.fields) {
        if (field.type === "file") {
          const entries = formData.getAll(field.name).filter(
            (v): v is File => v instanceof File && v.size > 0
          );
          const uploaded: SubmissionFile[] = [];
          for (const file of entries) {
            const { url, size } = await uploadFile(
              `submissions/${id}/files`,
              file.name,
              file
            );
            uploaded.push({ url, name: file.name, size });
          }
          if (uploaded.length) files[field.name] = uploaded;
          if (field.required && uploaded.length === 0) {
            missingRequired.push(field.label);
          }
        } else if (field.type === "signature") {
          const raw = formData.get(field.name);
          const value = typeof raw === "string" ? raw : "";
          if (value && value.startsWith("data:image")) {
            const url = await uploadDataUrl(
              `submissions/${id}/signatures`,
              `${field.name}.png`,
              value
            );
            signatures[field.name] = url;
          } else if (field.required) {
            missingRequired.push(field.label);
          }
        } else {
          const raw = formData.get(field.name);
          const value = typeof raw === "string" ? raw.trim() : "";
          data[field.name] = value;
          if (field.required && !value) {
            missingRequired.push(field.label);
          }
        }
      }
    }

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: "Faltan campos obligatorios",
          fields: missingRequired,
        },
        { status: 400 }
      );
    }

    const submission: Submission = {
      id,
      createdAt: new Date().toISOString(),
      data,
      files,
      signatures,
      configVersion: config.version,
    };

    await saveSubmission(submission);

    sendNotificationEmail(config, submission).catch(() => {});

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("submit error", err);
    return NextResponse.json(
      { error: "No se pudo procesar el envío. Intente de nuevo." },
      { status: 500 }
    );
  }
}
