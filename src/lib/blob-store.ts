import { getStore } from "@netlify/blobs";
import { DEFAULT_CONFIG } from "./default-config";
import { FormConfig, Submission } from "./types";

const STORE_NAME = "captacion-form";
const CONFIG_KEY = "config/current.json";

function store() {
  return getStore(STORE_NAME);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function getConfig(): Promise<FormConfig> {
  try {
    const json = (await store().get(CONFIG_KEY, {
      type: "json",
    })) as FormConfig | null;
    if (!json) {
      await saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    return json;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: FormConfig): Promise<void> {
  await store().setJSON(CONFIG_KEY, config);
}

export async function saveSubmission(submission: Submission): Promise<void> {
  await store().setJSON(`submissions/${submission.id}.json`, submission);
}

export async function listSubmissions(): Promise<Submission[]> {
  const { blobs } = await store().list({ prefix: "submissions/" });
  const results: Submission[] = [];
  for (const item of blobs) {
    if (!item.key.endsWith(".json")) continue;
    try {
      const data = (await store().get(item.key, {
        type: "json",
      })) as Submission | null;
      if (data) results.push(data);
    } catch {
      // skip unreadable entries
    }
  }
  results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return results;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  try {
    return (await store().get(`submissions/${id}.json`, {
      type: "json",
    })) as Submission | null;
  } catch {
    return null;
  }
}

export async function uploadFile(
  pathPrefix: string,
  filename: string,
  file: File | Blob
): Promise<{ url: string; size: number }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${pathPrefix}/${Date.now()}-${randomSuffix()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType =
    "type" in file && file.type ? file.type : "application/octet-stream";
  await store().set(key, new Blob([buffer]), {
    metadata: { contentType, filename: safeName },
  });
  return { url: `/api/blob/${key}`, size: buffer.byteLength };
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
  const key = `${pathPrefix}/${randomSuffix()}-${filename}`;
  await store().set(key, new Blob([buffer]), { metadata: { contentType } });
  return `/api/blob/${key}`;
}

export async function deleteSubmission(id: string): Promise<void> {
  await store()
    .delete(`submissions/${id}.json`)
    .catch(() => {});
}

// Reads the raw bytes of a file stored via uploadFile/uploadDataUrl, given
// the storage key (everything after "/api/blob/" in the url they returned).
// Used by pdf.ts to embed signatures without a round-trip HTTP fetch, and by
// the /api/blob/[...key] route to serve files, signatures and the logo.
export async function getBlobBytes(
  key: string
): Promise<{ bytes: Uint8Array; contentType?: string } | null> {
  try {
    const buf = await store().get(key, { type: "arrayBuffer" });
    if (!buf) return null;
    const meta = await store()
      .getMetadata(key)
      .catch(() => null);
    const contentType =
      (meta?.metadata?.contentType as string | undefined) || undefined;
    return { bytes: new Uint8Array(buf), contentType };
  } catch {
    return null;
  }
}
