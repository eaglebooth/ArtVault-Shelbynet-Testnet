"use client";

import { WalletButton } from "./WalletConnect";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-shelby-border/60 bg-shelby-dark/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-shelby-pink shadow-lg shadow-shelby-pink/40">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">ArtVault</span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-shelby-pink/30 bg-shelby-pink/10 px-3 py-1.5 text-xs font-semibold text-shelby-pink">
            <span className="h-1.5 w-1.5 rounded-full bg-shelby-pink animate-pulse" />
            Shelbynet Testnet
          </span>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
