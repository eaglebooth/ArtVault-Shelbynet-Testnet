import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".shelby-vault-data");
const ASSETS_FILE = path.join(DATA_DIR, "assets.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ASSETS_FILE)) fs.writeFileSync(ASSETS_FILE, "[]");
}

export type Asset = {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  createdAt: string;
};

export function listAssets(): Asset[] {
  ensureStore();
  try {
    const raw = fs.readFileSync(ASSETS_FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveAsset(input: {
  imageUrl: string;
  prompt: string;
  model: string;
}): Asset {
  ensureStore();
  const asset: Asset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: input.imageUrl,
    prompt: input.prompt,
    model: input.model,
    createdAt: new Date().toISOString(),
  };
  const current = listAssets();
  current.unshift(asset);
  fs.writeFileSync(ASSETS_FILE, JSON.stringify(current, null, 2));
  return asset;
}

export function deleteAsset(id: string): boolean {
  ensureStore();
  const current = listAssets();
  const next = current.filter((a) => a.id !== id);
  if (next.length === current.length) return false;
  fs.writeFileSync(ASSETS_FILE, JSON.stringify(next, null, 2));
  return true;
}
