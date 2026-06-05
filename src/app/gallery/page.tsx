"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Asset = {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  createdAt: string;
};

const MODEL_LABELS: Record<string, string> = {
  ideogram: "Ideogram",
  "playground-v2.5": "Playground v2.5",
  midjourney: "Midjourney",
  sdxl: "Ideogram",
  playground: "Playground v2.5",
  "flux-schnell": "Midjourney",
};

export default function GalleryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshing = useRef(false);

  const modelLabel = (m: string) => MODEL_LABELS[m] ?? m;

  const refreshAssets = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/assets", { cache: "no-store" });
      const data = await res.json();
      if (!cancelledRef.current)
        setAssets(Array.isArray(data.assets) ? data.assets : []);
    } catch {
      if (!cancelledRef.current) setAssets([]);
    } finally {
      refreshing.current = false;
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  const cancelledRef = useRef(false);

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
  }, [refreshAssets]);
    if (!id) return;
    if (!confirm("Delete this asset from the gallery?")) return;
    const prev = assets;
    setAssets((cur) => cur.filter((a) => a.id !== id));
    setSelected(null);
    try {
      const res = await fetch(`/api/assets?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setAssets(prev);
    }
  }, [assets]);

const handleDownload = useCallback(async () => {
  if (!selected?.imageUrl) return;
  const res = await fetch(selected.imageUrl);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = selected.prompt.replace(/[^a-z0-9_-]/gi, "_").slice(0, 60) || "vault-asset";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}, [selected]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/assets", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setAssets(Array.isArray(data.assets) ? data.assets : []);
      } catch {
        if (!cancelled) setAssets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered =
    filter === "all" ? assets : assets.filter((a) => a.model === filter);
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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
                  selected?.id === a.id ? "ring-shelby-pink ring-2" : "ring-shelby-border/60"
                }`}
              >
                <div className="aspect-[4/3] bg-shelby-bg">
                  <img src={a.imageUrl} alt={a.prompt} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-shelby-dark line-clamp-2">{a.prompt}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full bg-shelby-pink-soft px-2.5 py-0.5 text-xs font-semibold text-shelby-pink">
                      {modelLabel(a.model)}
                    </span>
                    <span className="text-xs text-emerald-600">Saved</span>
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
                <img src={selected.imageUrl} alt={selected.prompt} className="w-full rounded-xl" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-lg font-semibold text-shelby-dark line-clamp-3">{selected.prompt}</p>
                <p className="text-sm text-shelby-muted">
                  Model: {modelLabel(selected.model)} · Created {new Date(selected.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-shelby-muted">Asset ID: {selected.id}</p>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="mt-3 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  Delete
                </button>

        <button
          onClick={handleDownload}
          className="mt-3 ml-2 inline-flex items-center gap-1 rounded-full border border-shelby-border bg-white px-4 py-2 text-xs font-semibold text-shelby-dark transition-colors hover:bg-shelby-bg disabled:opacity-50"
          disabled={!selected.imageUrl}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
