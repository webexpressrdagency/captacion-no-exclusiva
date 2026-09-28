import { put, list, head, del } from "@vercel/blob";
import { DEFAULT_CONFIG } from "./default-config";
import { FormConfig, Submission } from "./types";

const CONFIG_PATH = "config/current.json";

export async function getConfig(): Promise<FormConfig> {
  try {
    const info = await head(CONFIG_PATH).catch(() => null);
    if (!info) {
      await saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONFIG;
    const json = (await res.json()) as FormConfig;
    return json;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: FormConfig): Promise<void> {
  const body = JSON.stringify(config, null, 2);
  await put(CONFIG_PATH, body, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function saveSubmission(submission: Submission): Promise<void> {
  const path = `submissions/${submission.id}.json`;
  await put(path, JSON.stringify(submission, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function listSubmissions(): Promise<Submission[]> {
  const results: Submission[] = [];
  let cursor: string | undefined = undefined;
  do {
    const page = await list({ prefix: "submissions/", cursor, limit: 100 });
    for (const item of page.blobs) {
      if (!item.pathname.endsWith(".json")) continue;
      try {
        const res = await fetch(item.url, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as Submission;
          results.push(data);
        }
      } catch {
        // skip unreadable entries
      }
    }
    cursor = page.cursor;
  } while (cursor);
  results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return results;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const path = `submissions/${id}.json`;
  const info = await head(path).catch(() => null);
  if (!info) return null;
  const res = await fetch(info.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as Submission;
}

export async function uploadFile(
  pathPrefix: string,
  filename: string,
  file: File | Blob
): Promise<{ url: string; size: number }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${pathPrefix}/${Date.now()}-${safeName}`;
  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: true,
  });
  const size = "size" in file ? (file as File).size : 0;
  return { url: blob.url, size };
}

export async function uploadDataUrl(
  pathPrefix: string,
  filename: string,
  dataUrl: string
): Promise<string> {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) throw new Error("Formato de imagen inválido");
  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const path = `${pathPrefix}/${filename}`;
  const blob = await put(path, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteSubmission(id: string): Promise<void> {
  await del(`submissions/${id}.json`).catch(() => {});
}
