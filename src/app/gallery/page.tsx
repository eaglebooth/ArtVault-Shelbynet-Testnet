"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Asset = {
  id: string;
  prompt: string;
  model: string;
  imageUrl: string;
  txDigest: string | null;
  blobName: string;
  shelbyOk: boolean;
  account: string | null;
  storedAt: string;
};

const MODEL_LABELS: Record<string, string> = {
  ideogram: "Ideogram",
  "playground-v2.5": "Playground v2.5",
  midjourney: "Midjourney",
  "stable-diffusion": "Stable Diffusion",
  sdxl: "SDXL",
  flux: "Flux",
  playground: "Playground v2.5",
  "flux-schnell": "Flux",
};

function getLocalAssets(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("shelby-vault:assets") ?? "[]");
  } catch {
    return [];
  }
}

function saveLocalAssets(assets: Asset[]) {
  localStorage.setItem("shelby-vault:assets", JSON.stringify(assets));
}

export default function GalleryPage() {
  const pathname = usePathname();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshing = useRef(false);
  const cancelledRef = useRef(false);

  const modelLabel = (m: string) => MODEL_LABELS[m] ?? m;

  const refreshAssets = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/assets", { cache: "no-store" });
      const data = await res.json();
      if (!cancelledRef.current) {
        setAssets(Array.isArray(data.assets) ? data.assets : []);
      }
    } catch {
      if (!cancelledRef.current) setAssets(getLocalAssets());
    } finally {
      refreshing.current = false;
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    refreshAssets();
    const onFocus = () => refreshAssets();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshAssets();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelledRef.current = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAssets, pathname]);

  const handleDelete = useCallback(
    async (id?: string) => {
      if (!id) return;
      if (!confirm("Delete this asset from the gallery?")) return;
      setAssets((cur) => cur.filter((a) => a.id !== id));
      setSelected(null);
      try {
        const res = await fetch(
          `/api/assets?id=${encodeURIComponent(id)}`,
          { method: "DELETE", cache: "no-store", next: { revalidate: 0 } }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Delete failed");
        }
      } catch (e) {
        console.error("delete failed:", e);
        alert(
          e instanceof Error ? e.message : "Delete failed, please refresh"
        );
      }
    },
    []
  );

  const handleDownload = useCallback(async () => {
    if (!selected?.blobName) return;
    try {
      const res = await fetch(
        `/api/download?blobName=${encodeURIComponent(selected.blobName)}`
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selected.blobName.split("/").pop() ?? "vault-asset";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("download failed:", err);
      alert(
        err instanceof Error ? err.message : "Download failed"
      );
    }
  }, [selected]);

  const filtered =
    filter === "all"
      ? assets
      : assets.filter((a) => a.model === filter);
  const models = Array.from(new Set(assets.map((a) => a.model)));

  return (
    <div className="flex flex-1 flex-col py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-shelby-dark">
              Public Gallery
            </h1>
            <p className="mt-1 text-shelby-muted">
              Browsing the public vault — assets created in this session.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-shelby-border bg-white px-3 py-2 text-sm text-shelby-dark focus:border-shelby-pink focus:outline-none"
            >
              <option value="all">All models</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {modelLabel(m)}
                </option>
              ))}
            </select>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-shelby-border px-4 py-2 text-sm font-medium text-shelby-dark transition-colors hover:border-shelby-pink hover:text-shelby-pink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border-2 border-dashed border-shelby-border bg-white p-10 text-center text-shelby-muted">
            Loading gallery…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-shelby-border bg-white p-10 text-center">
            <p className="text-shelby-muted">
              No assets yet.{" "}
              <Link href="/create" className="text-shelby-pink underline">
                Create the first one →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`group overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 transition-all hover:shadow-lg hover:shadow-shelby-pink/10 hover:-translate-y-1 ${
                  selected?.id === a.id
                    ? "ring-shelby-pink ring-2"
                    : "ring-shelby-border/60"
                }`}
              >
                <div className="aspect-[4/3] bg-shelby-bg relative flex items-center justify-center">
                  {a.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={a.imageUrl}
                      alt={a.prompt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-10 w-10 text-shelby-pink/40"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                        />
                      </svg>
                      <p className="text-xs text-shelby-muted line-clamp-2 font-mono">
                        {a.blobName}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {a.prompt && (
                    <p className="text-sm font-medium text-shelby-dark line-clamp-2">
                      {a.prompt}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full bg-shelby-pink-soft px-2.5 py-0.5 text-xs font-semibold text-shelby-pink">
                      {modelLabel(a.model)}
                    </span>
                    <span className="text-xs text-emerald-600">
                      {a.shelbyOk ? "On Shelby" : "Demo"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-8 rounded-2xl border border-shelby-border/60 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="sm:w-72 lg:w-96 shrink-0">
                {selected.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selected.imageUrl}
                    alt={selected.prompt}
                    className="w-full rounded-xl"
                  />
                ) : (
                  <div className="flex h-full min-h-48 items-center justify-center rounded-xl bg-shelby-bg">
                    <p className="text-xs text-shelby-muted font-mono line-clamp-3 p-4 text-center">
                      {selected.blobName}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                {selected.prompt && (
                  <p className="text-lg font-semibold text-shelby-dark line-clamp-3">
                    {selected.prompt}
                  </p>
                )}
                <p className="text-sm text-shelby-muted">
                  Model: {modelLabel(selected.model)} · Created{" "}
                  {new Date(selected.storedAt).toLocaleString()}
                </p>
                <p className="text-xs text-shelby-muted">
                  Asset ID: {selected.id}
                </p>
                <p className="text-xs font-mono text-shelby-muted break-all">
                  Blob: {selected.blobName}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={!selected.blobName}
                    className="rounded-full border border-shelby-border bg-white px-4 py-2 text-xs font-semibold text-shelby-dark transition-colors hover:bg-shelby-bg disabled:opacity-50"
                  >
                    Download from Shelby
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
