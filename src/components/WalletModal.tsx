"use client";

import { useState, useEffect, useRef } from "react";
import { WalletItem } from "@aptos-labs/wallet-adapter-react";

export default function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-shelby-border bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-shelby-dark">Connect Wallet</h2>
            <p className="mt-0.5 text-sm text-shelby-muted">Choose your Aptos wallet</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-shelby-muted transition-colors hover:bg-shelby-pink-soft hover:text-shelby-pink"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <WalletList onConnect={onClose} />

        <p className="mt-4 text-center text-xs text-shelby-muted">
          Powered by Aptos Wallet Standard · Testnet
        </p>
      </div>
    </div>
  );
}

function WalletList({ onConnect }: { onConnect: () => void }) {
  const [wallets, setWallets] = useState<any[]>([]);
  const [notDetected, setNotDetected] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const walletMod = await import("@aptos-labs/wallet-adapter-react") as any;
    const { getWallets, getNotDetectedWallets } = walletMod;
        const w = getWallets();
        const n = getNotDetectedWallets();
        if (!cancelled) {
          setWallets(w);
          setNotDetected(n);
        }
      } catch {
        // fallback: try useWallet hook dynamically
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const detected = wallets;

  if (detected.length === 0 && notDetected.length === 0) {
    return (
      <div className="rounded-xl border border-shelby-border/60 bg-shelby-bg/50 p-4 text-center text-sm text-shelby-muted">
        No wallets detected. Please install an Aptos wallet extension.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {detected.map((w) => (
        <WalletItem
          key={w.name}
          wallet={w}
          onConnect={onConnect}
          className="flex w-full items-center gap-3 rounded-xl border border-shelby-border/60 bg-shelby-bg/50 px-4 py-3 text-left transition-colors hover:border-shelby-pink/40 hover:bg-shelby-pink-soft"
        >
          <WalletItem.Icon className="h-8 w-8 rounded-lg bg-white p-1" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-shelby-dark">
              <WalletItem.Name />
            </div>
            <div className="text-xs text-shelby-muted">Ready to connect</div>
          </div>
          <WalletItem.ConnectButton className="text-shelby-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </WalletItem.ConnectButton>
        </WalletItem>
      ))}
    </div>
  );
}
