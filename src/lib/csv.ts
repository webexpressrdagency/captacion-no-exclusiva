import { FormConfig, Submission } from "./types";

function csvEscape(value: string): string {
  const v = value ?? "";
  if (/[",\n;]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function submissionsToCsv(
  config: FormConfig,
  submissions: Submission[]
): string {
  const fieldNames: { name: string; label: string }[] = [];
  for (const block of config.blocks) {
    if (block.kind === "fieldRow") {
      for (const field of block.fields) {
        if (field.type === "signature") continue;
        fieldNames.push({ name: field.name, label: field.label });
      }
    }
  }

  const headers = [
    "ID",
    "Fecha",
    ...fieldNames.map((f) => f.label),
    "Archivos adjuntos",
  ];

  const rows = submissions.map((s) => {
    const fileCount = Object.values(s.files).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    return [
      s.id,
      new Date(s.createdAt).toLocaleString("es-DO"),
      ...fieldNames.map((f) => s.data[f.name] || ""),
      String(fileCount),
    ];
  });

  const lines = [headers, ...rows].map((row) =>
    row.map(csvEscape).join(",")
  );
  return "﻿" + lines.join("\n");
}
