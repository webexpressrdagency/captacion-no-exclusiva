import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { Block, FormConfig, Submission } from "./types";
import { getBlobBytes } from "./blob-store";

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function stripBold(text: string): { text: string; bold: boolean }[] {
  const parts = text.split("**");
  return parts.map((t, i) => ({ text: t, bold: i % 2 === 1 }));
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function generateSubmissionPdf(
  config: FormConfig,
  submission: Submission
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawParagraph = (text: string, size = 10, lineGap = 4) => {
    const segments = stripBold(text);
    let cursorX = MARGIN;
    let lineWords: { text: string; bold: boolean }[] = [];

    // simple approach: render segment by segment, wrapping manually per segment
    for (const seg of segments) {
      const words = seg.text.split(/(\s+)/);
      for (const w of words) {
        if (w === "") continue;
        const f = seg.bold ? boldFont : font;
        const width = f.widthOfTextAtSize(w, size);
        if (cursorX + width > MARGIN + CONTENT_WIDTH) {
          y -= size + lineGap;
          ensureSpace(size + lineGap);
          cursorX = MARGIN;
        }
        if (w.trim() !== "") {
          ensureSpace(size + lineGap);
          page.drawText(w, {
            x: cursorX,
            y,
            size,
            font: f,
            color: rgb(0.1, 0.1, 0.1),
          });
        }
        cursorX += width;
      }
    }
    y -= size + lineGap + 4;
  };

  const drawHeading = (text: string, size: number) => {
    ensureSpace(size + 14);
    const lines = wrapText(text, boldFont, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(size + 6);
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= size + 6;
    }
    y -= 6;
  };

  const drawFieldValue = (label: string, value: string) => {
    ensureSpace(16);
    page.drawText(`${label}:`, {
      x: MARGIN,
      y,
      size: 10,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    const labelWidth = boldFont.widthOfTextAtSize(`${label}: `, 10);
    const lines = wrapText(
      value || "—",
      font,
      10,
      CONTENT_WIDTH - labelWidth
    );
    page.drawText(lines[0] || "—", {
      x: MARGIN + labelWidth,
      y,
      size: 10,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 16;
    for (const extra of lines.slice(1)) {
      ensureSpace(14);
      page.drawText(extra, {
        x: MARGIN + labelWidth,
        y,
        size: 10,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
  };

  drawHeading(config.meta.title, 15);
  y -= 4;

  for (const block of config.blocks) {
    if (block.kind === "heading") {
      drawHeading(block.text, block.level === 1 ? 13 : block.level === 2 ? 12 : 11);
    } else if (block.kind === "richText") {
      for (const para of block.text.split("\n")) {
        if (para.trim() === "") {
          y -= 6;
          continue;
        }
        drawParagraph(para, 9.5);
      }
    } else if (block.kind === "divider") {
      ensureSpace(14);
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: MARGIN + CONTENT_WIDTH, y },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      y -= 14;
    } else if (block.kind === "fieldRow") {
      for (const field of block.fields) {
        if (field.type === "signature") {
          const url = submission.signatures[field.name];
          ensureSpace(90);
          page.drawText(`${field.label}:`, {
            x: MARGIN,
            y,
            size: 10,
            font: boldFont,
          });
          y -= 14;
          if (url) {
            try {
              let bytes: Uint8Array;
              let isPng: boolean;
              if (url.startsWith("data:")) {
                const match = url.match(/^data:(image\/\w+);base64,(.*)$/);
                if (!match) throw new Error("data url inválida");
                isPng = match[1].includes("png");
                bytes = new Uint8Array(Buffer.from(match[2], "base64"));
              } else if (url.startsWith("/api/blob/")) {
                const key = url
                  .slice("/api/blob/".length)
                  .split("/")
                  .map((p) => decodeURIComponent(p))
                  .join("/");
                const result = await getBlobBytes(key);
                if (!result) throw new Error("firma no encontrada");
                bytes = result.bytes;
                isPng =
                  (result.contentType || "").includes("png") ||
                  url.toLowerCase().includes(".png");
              } else {
                const res = await fetch(url);
                bytes = new Uint8Array(await res.arrayBuffer());
                isPng = url.toLowerCase().includes(".png");
              }
              const img = isPng
                ? await pdfDoc.embedPng(bytes)
                : await pdfDoc.embedJpg(bytes);
              const dims = img.scaleToFit(180, 70);
              ensureSpace(dims.height + 10);
              page.drawImage(img, {
                x: MARGIN,
                y: y - dims.height,
                width: dims.width,
                height: dims.height,
              });
              y -= dims.height + 14;
            } catch {
              drawParagraph("(no se pudo incrustar la firma)", 9);
            }
          } else {
            drawParagraph("(sin firmar)", 9);
          }
        } else if (field.type === "file") {
          const files = submission.files[field.name] || [];
          drawFieldValue(
            field.label,
            files.length
              ? `${files.length} archivo(s) adjunto(s)`
              : "Sin archivos"
          );
        } else if (field.type === "checkbox") {
          const val = submission.data[field.name];
          drawFieldValue(field.label, val ? "Sí" : "No");
        } else {
          drawFieldValue(field.label, submission.data[field.name] || "");
        }
      }
    }
  }

  ensureSpace(40);
  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + CONTENT_WIDTH, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;
  page.drawText(
    `Enviado: ${new Date(submission.createdAt).toLocaleString("es-DO")}`,
    { x: MARGIN, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) }
  );
  y -= 12;
  page.drawText(`ID: ${submission.id}`, {
    x: MARGIN,
    y,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  return pdfDoc.save();
}
