"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

const steps = [
  {
    num: "01",
    title: "Generate",
    desc: "Enter a prompt. Pick a model. Replicate generates your image in seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Store on Shelby",
    desc: "Your image is split, erasure-coded, and uploaded to Shelby's decentralized network with a Merkle proof.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Verify on Aptos",
    desc: "The Merkle root is anchored on Aptos. Anyone can verify your original — no middleman needed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Cryptographic Provenance",
    desc: "Every asset carries a Merkle proof — anchored on Aptos, stored on Shelby Protocol. Nobody can forge or silently modify your original.",
    emoji: "🔐",
  },
  {
    title: "Decentralized Storage",
    desc: "No AWS S3, no vendor lock-in. Your blobs live on Shelby — an incentivized, decentralized network built for scale.",
    emoji: "🌐",
  },
  {
    title: "Creator-Owned",
    desc: "Your Aptos address is your identity. No middleman, no account deletion risk. You own your vault.",
    emoji: "✍️",
  },
];

const sampleAssets = [
  { prompt: "Cyberpunk city at golden hour", model: "SDXL", seed: "cyber1" },
  { prompt: "Surreal underwater library", model: "SD3", seed: "water2" },
  { prompt: "Minimalist logo for AI startup", model: "SDXL", seed: "logo3" },
  { prompt: "Neon samurai in rain", model: "SDXL", seed: "neon4" },
  { prompt: "Botanical garden on Mars", model: "SD3", seed: "mars5" },
  { prompt: "Paper craft fox in autumn forest", model: "SDXL", seed: "fox6" },
];

function SampleCard({ prompt, model, seed }: { prompt: string; model: string; seed: string }) {
  const gradients: Record<string, string> = {
    cyber1: "from-violet-500 to-fuchsia-500",
    water2: "from-cyan-400 to-blue-600",
    logo3: "from-shelby-pink to-amber-400",
    neon4: "from-indigo-600 to-shelby-coral",
    mars5: "from-orange-500 to-rose-600",
    fox6: "from-amber-300 to-orange-500",
  };

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-shelby-border/60 transition-all hover:shadow-lg hover:shadow-shelby-pink/10 hover:-translate-y-1">
      <div className={`aspect-[4/3] bg-gradient-to-br ${gradients[seed] ?? "from-shelby-pink to-shelby-lavender"} relative`}>
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="p-3.5">
        <p className="text-sm font-medium text-shelby-dark line-clamp-2">{prompt}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full bg-shelby-pink-soft px-2.5 py-0.5 text-xs font-semibold text-shelby-pink">
            {model}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-shelby-muted">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-emerald-500">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-shelby-pink-soft via-shelby-bg to-white" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-shelby-pink/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-shelby-lavender/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-shelby-pink text-white shadow-xl shadow-shelby-pink/40">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-shelby-dark sm:text-6xl lg:text-7xl">
              Your AI Art,{" "}
              <span className="bg-gradient-to-r from-shelby-pink to-shelby-coral bg-clip-text text-transparent">
                Immutably
              </span>{" "}
              Yours
            </h1>
            <p className="mt-6 text-lg leading-8 text-shelby-muted sm:text-xl">
              Every generation is verifiably yours — stored on Shelby Protocol, verified on Aptos. No S3, no middleman, no doubt.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/create"
                className="w-full rounded-full bg-shelby-pink px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-shelby-pink/30 transition-all hover:bg-shelby-pink-hover hover:shadow-xl hover:shadow-shelby-pink/40 active:scale-95 sm:w-auto"
              >
                Start Vaulting →
              </Link>
              <Link
                href="/gallery"
                className="w-full rounded-full border-2 border-shelby-pink/30 bg-white px-8 py-3.5 text-center text-base font-semibold text-shelby-pink transition-all hover:border-shelby-pink hover:bg-shelby-pink-soft sm:w-auto"
              >
                Explore Gallery
              </Link>
            </div>
            <p className="mt-4 text-xs text-shelby-muted">No wallet required to explore. Connect to vault.</p>
          </div>
        </div></section>

      {/* ── How It Works ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-shelby-dark sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-shelby-muted">Three steps. One proof. Truly yours.</p>
          </div>
          <div className="mx-auto mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="rounded-2xl border border-shelby-border/60 bg-shelby-bg p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-shelby-pink-soft text-shelby-pink">
                  {s.icon}
                </div>
                <span className="text-xs font-semibold text-shelby-muted">{s.num}</span>
                <h3 className="mt-1 text-lg font-semibold text-shelby-dark">{s.title}</h3>
                <p className="mt-2 text-sm text-shelby-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-shelby-dark sm:text-4xl">
              Built for creators
            </h2>
            <p className="mt-4 text-lg text-shelby-muted">Proof, storage and ownership — without the middleman.</p>
          </div>
          <div className="mx-auto mt-16 grid gap-8 sm:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="rounded-2xl border border-shelby-border/60 bg-white p-6">
                <span className="text-2xl">{f.emoji}</span>
                <h3 className="mt-3 text-lg font-semibold text-shelby-dark">{f.title}</h3>
                <p className="mt-2 text-sm text-shelby-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery preview ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-shelby-dark sm:text-4xl">
              Community vaults
            </h2>
            <p className="mt-4 text-lg text-shelby-muted">
              Browse the latest creations — each one cryptographically verifiable.
            </p>
          </div>
          <div className="mx-auto mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {sampleAssets.map((a) => (
              <SampleCard key={a.seed} {...a} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-shelby-pink px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-shelby-pink-hover active:scale-95"
            >
              View full gallery
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
