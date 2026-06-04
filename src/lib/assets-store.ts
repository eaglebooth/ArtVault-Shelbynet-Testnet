import fs from "fs";
import path from "path";

const USE_BLOB = !!process.env.BLOB_STORE_ID;

const DATA_DIR = path.join(process.cwd(), ".shelby-vault-data");
const ASSETS_FILE = path.join(DATA_DIR, "assets.json");

export type Asset = {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  createdAt: string;
};

function ensureLocal() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ASSETS_FILE)) fs.writeFileSync(ASSETS_FILE, "[]");
}

function localRead(): Asset[] {
  ensureLocal();
  try {
    const raw = fs.readFileSync(ASSETS_FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function localWrite(items: Asset[]) {
  ensureLocal();
  fs.writeFileSync(ASSETS_FILE, JSON.stringify(items, null, 2));
}

async function blobRead(): Promise<Asset[]> {
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "" });
    const hit = blobs.find((b: any) => b.pathname === "assets.json");
    if (!hit?.url) return [];
    const res = await fetch(hit.url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[assets-store] blobRead failed:", err);
    return [];
  }
}

async function blobWrite(items: Asset[]) {
  const { put } = await import("@vercel/blob");
  await put("assets.json", JSON.stringify(items, null, 2), {
    access: "public",
    contentType: "application/json",
  });
}

export async function listAssets(): Promise<Asset[]> {
  if (USE_BLOB) {
    return blobRead();
  }
  return localRead();
}

export async function saveAsset(input: {
  imageUrl: string;
  prompt: string;
  model: string;
}): Promise<Asset> {
  const asset: Asset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: input.imageUrl,
    prompt: input.prompt,
    model: input.model,
    createdAt: new Date().toISOString(),
  };

  if (!USE_BLOB) {
    try {
      const cur = localRead();
      cur.unshift(asset);
      localWrite(cur);
    } catch (err) {
      console.error("[assets-store] local write failed:", err);
    }
    return asset;
  }

  (async () => {
    try {
      const cur = await blobRead();
      cur.unshift(asset);
      await blobWrite(cur);
    } catch (err) {
      console.error("[assets-store] blob write failed:", err);
    }
  })();

  return asset;
}

export async function deleteAsset(id: string): Promise<boolean> {
  if (!USE_BLOB) {
    try {
      const cur = localRead();
      const next = cur.filter((a) => a.id !== id);
      if (next.length === cur.length) return false;
      localWrite(next);
      return true;
    } catch (err) {
      console.error("[assets-store] local delete failed:", err);
      return false;
    }
  }

  (async () => {
    try {
      const cur = await blobRead();
      const next = cur.filter((a) => a.id !== id);
      await blobWrite(next);
    } catch (err) {
      console.error("[assets-store] blob delete failed:", err);
    }
  })();

  return true;
}
