import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSubmission, getConfig } from "@/lib/blob-store";
import { generateSubmissionPdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const submission = await getSubmission(params.id);
  if (!submission) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const config = await getConfig();
  const bytes = await generateSubmissionPdf(config, submission);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${submission.id}.pdf"`,
    },
  });
}
