"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "prompt" | "generating" | "storing" | "done";

const MODEL_OPTIONS = [
  { value: "ideogram", label: "Ideogram" },
  { value: "playground-v2.5", label: "Playground v2.5" },
  { value: "midjourney", label: "Midjourney" },
  { value: "stable-diffusion", label: "Stable Diffusion" },
  { value: "sdxl", label: "SDXL" },
  { value: "flux", label: "Flux" },
] as const;

type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];

async function saveAsset(input: { imageUrl: string; prompt: string; model: string }) {
  try {
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("saveAsset failed:", err);
      return null;
    }
    const data = await res.json();
    return data.asset ?? data;
  } catch (e) {
    console.error("saveAsset error:", e);
    return null;
  }
}

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelValue>("midjourney");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;

      setError(null);
      setStep("generating");
      setProgress("Contacting Replicate…");

      try {
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), model }),
        });

        if (!genRes.ok) {
          const err = await genRes.json();
          throw new Error(err.error ?? "Generation failed");
        }

        const { imageUrl: url, error: genError } = (await genRes.json()) as {
  imageUrl: string;
  error?: string;
};
if (genError) {
  setError(genError);
  setStep("prompt");
  return;
}
setImageUrl(url);
        setStep("storing");
        setProgress("Fetching image data…");

        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error("Failed to fetch generated image");
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        setProgress("Preparing Shelby upload…");

        const slug = prompt
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40);
        const ts = Date.now();
        const blobName = `art/${slug}-${ts}.png`;

        setProgress("Sign transaction on Aptos (wallet popup)…");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account: null,
            blobName,
            blobData: base64,
            totalBytes: arrayBuffer.byteLength,
          }),
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error ?? "Upload to Shelby failed");
        }

        const saved = await saveAsset({
          imageUrl: url,
          prompt: prompt.trim(),
          model,
        });

        if (saved?.id) {
          setProgress("Done!");
          setStep("done");
        } else {
          setError(saved?.error ?? "Failed to save asset");
          setStep("prompt");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep("prompt");
      }
    },
    [prompt, model]
  );

  const isLoading = step === "generating" || step === "storing";

  return (
    <div className="flex flex-1 flex-col items-center pt-4 pb-10">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-shelby-pink shadow-sm ring-1 ring-shelby-border transition-colors hover:bg-shelby-pink-soft"
          >
            ← Back
          </Link>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-shelby-pink to-shelby-coral text-white shadow-xl shadow-shelby-pink/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 003.09 3.09z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-shelby-dark sm:text-4xl">
            {step === "done" ? "Vaulted!" : "Create a new vault asset"}
          </h1>
          <p className="mt-3 text-shelby-muted">
            {step === "done"
              ? "Your AI art is now on Shelby Protocol. Merkle-verified, immutably yours."
              : "Enter a prompt, pick a model, generate, and vault the result on Shelby."}
          </p>
        </div>

        {(step === "generating" || step === "storing") && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-shelby-border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-shelby-pink/20 border-t-shelby-pink" />
            <p className="text-sm font-medium text-shelby-dark">{progress}</p>
            <p className="mt-1 text-xs text-shelby-muted">This can take 20–60 seconds…</p>
          </div>
        )}

        {imageUrl && step !== "prompt" && (
          <div className="mx-auto mt-8 max-w-md">
            <div className="overflow-hidden rounded-2xl ring-1 ring-shelby-border/60 shadow-lg">
              <img src={imageUrl} alt={prompt} className="w-full" />
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="mx-auto mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Stored on Shelby Protocol
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-full border border-shelby-border px-5 py-2.5 text-sm font-semibold text-shelby-dark transition-colors hover:border-shelby-pink hover:text-shelby-pink"
              >
                ← Back home
              </Link>
              <Link
                href="/create"
                className="rounded-full bg-shelby-pink px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover active:scale-95"
              >
                Create another
              </Link>
            </div>
          </div>
        )}

        {step === "prompt" && (
          <div className="mx-auto mt-8 rounded-2xl border-2 border-dashed border-shelby-border bg-white p-6 shadow-sm sm:p-8">
            <form ref={formRef} onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label htmlFor="prompt" className="mb-1.5 block text-sm font-semibold text-shelby-dark">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="A cyberpunk cat wearing a hoodie, neon-lit Tokyo street, cinematic lighting…"
                  className="w-full rounded-xl border border-shelby-border bg-shelby-bg px-4 py-3 text-sm text-shelby-dark placeholder:text-shelby-muted/60 focus:border-shelby-pink focus:outline-none focus:ring-2 focus:ring-shelby-pink/20"
                />
              </div>

              <div>
                <label htmlFor="model" className="mb-1.5 block text-sm font-semibold text-shelby-dark">
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value as ModelValue)}
                  className="w-full rounded-xl border border-shelby-border bg-shelby-bg px-4 py-3 text-sm text-shelby-dark focus:border-shelby-pink focus:outline-none focus:ring-2 focus:ring-shelby-pink/20"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="w-full rounded-full bg-shelby-pink px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover hover:shadow-xl hover:shadow-shelby-pink/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate & Vault →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
