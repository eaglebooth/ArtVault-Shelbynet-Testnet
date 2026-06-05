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

async function blobListAssetBlobs(): Promise<{ id: string; url?: string }[]> {
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "assets/" });
    return blobs
      .filter((b: any) => b.pathname.endsWith(".json"))
      .map((b: any) => ({
        id: path.basename(b.pathname, ".json"),
        url: b.url,
      }));
  } catch (err) {
    console.error("[assets-store] blobListAssetBlobs failed:", err);
    return [];
  }
}

async function blobReadAll(): Promise<Asset[]> {
  const entries = await blobListAssetBlobs();
  const results = await Promise.all(
    entries.map(async (entry) => {
      try {
        const res = await fetch(entry.url!, {
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          next: { revalidate: 0 },
        });
        if (!res.ok) return null;
        return (await res.json()) as Asset;
      } catch {
        return null;
      }
    })
  );
  return results.filter((a): a is Asset => a != null);
}

async function blobWriteAsset(asset: Asset) {
  const { put } = await import("@vercel/blob");
  await put(`assets/${asset.id}.json`, JSON.stringify(asset), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

async function blobDeleteAsset(id: string) {
  const { del } = await import("@vercel/blob");
  try {
    await del(`assets/${id}.json`);
  } catch (err) {
    console.error("[assets-store] blobDeleteAsset failed:", err);
  }
}

export async function listAssets(): Promise<Asset[]> {
  if (USE_BLOB) {
    return blobReadAll();
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

  try {
    if (USE_BLOB) {
      await blobWriteAsset(asset);
    } else {
      const cur = localRead();
      cur.unshift(asset);
      localWrite(cur);
    }
  } catch (err) {
    console.error("[assets-store] save failed:", err);
  }
  return asset;
}

export async function deleteAsset(id: string): Promise<boolean> {
  try {
    if (USE_BLOB) {
      await blobDeleteAsset(id);
    } else {
      const cur = localRead();
      const next = cur.filter((a) => a.id !== id);
      if (next.length === cur.length) return false;
      localWrite(next);
    }
    return true;
  } catch (err) {
    console.error("[assets-store] delete failed:", err);
    return false;
  }
}
