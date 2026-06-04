"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function VaultPage() {
  const params = useParams();
  const address = String(params.address ?? "demo");
  const isDemo = address === "demo";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getLocalAssets();
    const filtered = isDemo ? stored : stored.filter((a) => a.account === address);
    setAssets(filtered);
    setLoading(false);
  }, [address, isDemo]);

  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveLocalAssets(next);
      if (selected?.id === id) setSelected(null);
      return next;
    });
  }, [selected]);

  return (
    <div className="flex flex-1 flex-col py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-shelby-dark">Vault</h1>
            <p className="mt-1 font-mono text-sm text-shelby-muted">
              {isDemo ? "Demo vault (browser session)" : `${address.slice(0, 6)}…${address.slice(-4)}`}
            </p>
            {isDemo && (
              <p className="mt-1 text-xs text-shelby-muted">
                Connect a wallet to see your address-specific vault.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-shelby-border px-4 py-2.5 text-sm font-medium text-shelby-dark transition-colors hover:border-shelby-pink hover:text-shelby-pink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-shelby-pink px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover active:scale-95"
            >
              + New Asset
            </Link>
          </div>
        </div>

        {/* Selected asset detail */}
        {selected && (
          <div className="mb-8 rounded-2xl border border-shelby-border/60 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="sm:w-72 lg:w-96 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.imageUrl} alt={selected.prompt} className="w-full rounded-xl" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-lg font-semibold text-shelby-dark line-clamp-3">{selected.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-shelby-pink-soft px-3 py-1 text-xs font-semibold text-shelby-pink">
                    {selected.model}
                  </span>
                  {selected.shelbyOk ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Verified on Shelby
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                      {(selected as any).shelbyError ?? "Saved via vault"}
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-shelby-muted">Blob name</dt>
                    <dd className="mt-0.5 break-all font-mono text-xs text-shelby-dark">{selected.blobName}</dd>
                  </div>
                  <div>
                    <dt className="text-shelby-muted">Created</dt>
                    <dd className="mt-0.5 font-mono text-xs text-shelby-dark">
                      {new Date(selected.storedAt).toLocaleString()}
                    </dd>
                  </div>
                  {selected.txDigest && (
                    <div className="col-span-2">
                      <dt className="text-shelby-muted">Reference</dt>
                      <dd className="mt-0.5 break-all font-mono text-xs text-shelby-pink">{selected.txDigest}</dd>
                    </div>
                  )}
                </dl>
                <button
                  onClick={() => deleteAsset(selected.id)}
                  className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-shelby-muted">Loading vault…</div>
        ) : assets.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-shelby-border bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-shelby-pink-soft text-shelby-pink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-shelby-dark">No assets yet</h2>
            <p className="mt-2 text-sm text-shelby-muted">
              {isDemo
                ? "Create your first asset and it will appear here."
                : "No blobs registered for this address."}
            </p>
            <Link
              href="/create"
              className="mt-5 inline-flex rounded-full bg-shelby-pink px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover"
            >
              Create your first asset →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`group overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 transition-all hover:shadow-lg hover:shadow-shelby-pink/10 hover:-translate-y-1 ${
                  selected?.id === a.id ? "ring-shelby-pink ring-2" : "ring-shelby-border/60"
                }`}
              >
                <div className="aspect-[4/3] bg-shelby-bg relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.imageUrl} alt={a.prompt} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-shelby-dark line-clamp-2">{a.prompt}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full bg-shelby-pink-soft px-2.5 py-0.5 text-xs font-semibold text-shelby-pink">
                      {a.model}
                    </span>
                    {a.shelbyOk ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">Demo</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
