"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

type UiStep = "connect" | "prompt" | "generating" | "storing" | "done";

const MODEL_OPTIONS = [
  { value: "ideogram", label: "Ideogram" },
  { value: "playground-v2.5", label: "Playground v2.5" },
  { value: "midjourney", label: "Midjourney" },
  { value: "stable-diffusion", label: "Stable Diffusion" },
  { value: "sdxl", label: "SDXL" },
  { value: "flux", label: "Flux" },
] as const;

type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];

export default function CreatePage() {
  const { account, connected, connect, wallets, disconnect } = useWallet();

  const [step, setStep] = useState<UiStep>("connect");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelValue>("ideogram");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (connected && account && step === "connect") {
      setStep("prompt");
    }
  }, [connected, account, step]);

  const handleConnect = useCallback(
    async (name: string) => {
      setError(null);
      try {
        await connect(name);
      } catch {
        setError("Wallet connection was rejected.");
      }
    },
    [connect]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch {}
    setStep("connect");
    setPrompt("");
    setImageUrl(null);
    setError(null);
  }, [disconnect]);

  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim() || !account) return;
      setError(null);
      setStep("generating");
      setProgress("Contacting image API…");
      setImageUrl(null);

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
        if (!url) throw new Error("No image returned");
        setImageUrl(url);

        setStep("storing");
        setProgress("Preparing upload…");

        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error("Failed to fetch generated image");
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const slug = prompt
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40);
        const blobName = `art/${account.address.toString().slice(0, 10)}/${slug}-${Date.now()}.png`;

        setProgress("Uploading to Shelby Protocol…");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account: account.address.toString(),
            blobName,
            blobData: base64,
            totalBytes: arrayBuffer.byteLength,
            imageUrl: url,
            prompt: prompt.trim(),
            model,
          }),
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error ?? "Upload to Shelby failed");
        }
        const uploadResult = await uploadRes.json();

        await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt.trim(),
            model,
            blobName: uploadResult.blobName,
            txDigest: uploadResult.txDigest,
            shelbyOk: uploadResult.shelbyOk,
            account: account.address.toString(),
          }),
        });

        setProgress("Done!");
        setStep("done");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep("prompt");
      }
    },
    [prompt, model, account]
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

        {/* ── Bước 1: Connect Wallet ── */}
        {step === "connect" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-shelby-pink to-shelby-coral text-white shadow-xl shadow-shelby-pink/40">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 11-6 0 3 3 0 016 0zM2.25 10.5h19.5m-19.5 3h19.5m-19.5 3h19.5M5.25 5.25v13.5a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V5.25m13.5 13.5v-9a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v9"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-shelby-dark sm:text-4xl">
              Connect Your Wallet
            </h1>
            <p className="mt-3 text-shelby-muted">
              Connect your Aptos wallet to verify ownership on-chain. Your
              address is your identity on ArtVault.
            </p>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-shelby-border bg-white p-6 shadow-sm">
              {connected && account ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-700">
                      Connected
                    </span>
                  </div>
                  <p className="break-all font-mono text-xs text-shelby-muted">
                    {account.address.toString()}
                  </p>
                  <button
                    onClick={handleDisconnect}
                    className="w-full rounded-full border border-shelby-border px-6 py-2.5 text-sm font-semibold text-shelby-dark transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    Disconnect
                  </button>
                  <button
                    onClick={() => setStep("prompt")}
                    className="w-full rounded-full bg-shelby-pink px-6 py-3 text-base font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover"
                  >
                    Continue to Create →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(wallets ?? []).length === 0 ? (
                    <p className="text-sm text-shelby-muted">
                      No Aptos wallets detected. Please install one (Petra,
                      Rise, OKX, etc.) and refresh.
                    </p>
                  ) : (
                    (wallets ?? []).map((w) => (
                      <button
                        key={w.name}
                        onClick={() => handleConnect(w.name)}
                        className="flex w-full items-center gap-3 rounded-xl border border-shelby-border/60 bg-shelby-bg/50 px-4 py-3 text-left transition-colors hover:border-shelby-pink/40 hover:bg-shelby-pink-soft"
                      >
                        {w.icon ? (
                          <img
                            src={w.icon}
                            alt={w.name}
                            className="h-8 w-8 rounded-lg bg-white p-1"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shelby-pink-soft text-xs font-bold text-shelby-pink">
                            {w.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-shelby-dark">
                            {w.name}
                          </p>
                          <p className="text-xs text-shelby-muted">
                            Ready to connect
                          </p>
                        </div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 text-shelby-pink"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bước 2: Prompt + Generate ── */}
        {step === "prompt" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-shelby-pink to-shelby-coral text-white shadow-xl shadow-shelby-pink/40">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 003.09 3.09z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-shelby-dark sm:text-4xl">
              Create a new vault asset
            </h1>
            <p className="mt-3 text-shelby-muted">
              Enter a prompt, pick a model, generate, and vault the result on
              Shelby Protocol.
            </p>

            <div className="mx-auto mt-6 flex items-center justify-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-shelby-pink text-xs font-bold text-white">
                1
              </span>
              <span className="h-px w-8 bg-shelby-border" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-shelby-pink text-xs font-bold text-white">
                2
              </span>
            </div>
            <div className="mx-auto mt-1 flex max-w-xs items-center justify-between text-xs text-shelby-muted">
              <span>Connect Wallet</span>
              <span>Generate & Vault</span>
            </div>

            <div className="mx-auto mt-8 rounded-2xl border-2 border-dashed border-shelby-border bg-white p-6 shadow-sm sm:p-8">
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label
                    htmlFor="prompt"
                    className="mb-1.5 block text-sm font-semibold text-shelby-dark"
                  >
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
                  <label
                    htmlFor="model"
                    className="mb-1.5 block text-sm font-semibold text-shelby-dark"
                  >
                    Model
                  </label>
                  <select
                    id="model"
                    value={model}
                    onChange={(e) =>
                      setModel(e.target.value as ModelValue)
                    }
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
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="w-full rounded-full bg-shelby-pink px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover hover:shadow-xl hover:shadow-shelby-pink/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate & Vault →
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full rounded-full border border-shelby-border px-6 py-2 text-xs font-medium text-shelby-muted transition-colors hover:border-red-300 hover:text-red-600"
                >
                  Disconnect wallet
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Loading states ── */}
        {(step === "generating" || step === "storing") && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-shelby-border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-shelby-pink/20 border-t-shelby-pink" />
            <p className="text-sm font-medium text-shelby-dark">{progress}</p>
            <p className="mt-1 text-xs text-shelby-muted">
              {step === "generating"
                ? "Generating image with AI…"
                : "Erasure-coding + uploading to Shelby network…"}
            </p>
            {imageUrl && (
              <div className="mx-auto mt-4 overflow-hidden rounded-xl ring-1 ring-shelby-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={prompt} className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="mx-auto mt-8 flex flex-col items-center gap-4">
            {imageUrl && (
              <div className="overflow-hidden rounded-2xl ring-1 ring-shelby-border/60 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={prompt} className="w-full max-w-md" />
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
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
      </div>
    </div>
  );
}
