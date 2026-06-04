"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const pink = "#FF6FD8";
const pinkDim = "rgba(255,111,216,0.12)";
const pinkDimBorder = "rgba(255,111,216,0.25)";
const textPrimary = "#2C1A14";
const textSecondary = "#7A5C52";
const textMuted = "#B89A91";
const border = "#EFE0DB";
const bgCard = "#FFFFFF";

const FALLBACK_WALLETS = [
  { name: "OKX Wallet", readyState: "Installed" as const },
  { name: "Google Wallet", readyState: "Installed" as const },
  { name: "Apple Wallet", readyState: "Installed" as const },
];

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function WalletModal({ onClose, wallets, onConnect }: {
  onClose: () => void;
  wallets: any[];
  onConnect: (name: string) => void;
}) {
  const list = wallets && wallets.length > 0 ? wallets : FALLBACK_WALLETS;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(44,26,20,0.35)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: bgCard, borderRadius: 20, padding: 24, width: "100%", maxWidth: 380,
        boxShadow: "0 24px 64px rgba(44,26,20,0.2)", animation: "modalIn 0.18s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: textPrimary }}>Connect Wallet</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: textMuted }}>Choose your Aptos wallet</p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(44,26,20,0.06)", border: "none", cursor: "pointer",
            color: textMuted, fontSize: 16, width: 30, height: 30, borderRadius: 999,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((wallet: any) => {
            const isReady = "readyState" in wallet ? wallet.readyState === "Installed" : true;
            return (
              <button key={wallet.name} onClick={() => { onConnect(wallet.name); onClose(); }} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12,
                border: `1.5px solid ${isReady ? pinkDimBorder : border}`,
                background: isReady ? "rgba(255,111,216,0.04)" : "#FAFAFA",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s", width: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FFF3FB"; e.currentTarget.style.borderColor = pink; }}
              onMouseLeave={e => { e.currentTarget.style.background = isReady ? "rgba(255,111,216,0.04)" : "#FAFAFA"; e.currentTarget.style.borderColor = isReady ? pinkDimBorder : border; }}
              >
                {wallet.icon ? (
                  <img src={wallet.icon} alt={wallet.name} style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: pinkDim, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: pink,
                  }}>{getInitials(wallet.name)}</div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: textPrimary }}>{wallet.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: textMuted }}>{isReady ? "Ready to connect" : "Click to install"}</p>
                </div>
                <span style={{ color: pink, fontSize: 18, flexShrink: 0 }}>→</span>
              </button>
            );
          })}
        </div>

        <p style={{ margin: "16px 0 0", fontSize: 11, color: textMuted, textAlign: "center" }}>
          Powered by Aptos Wallet Standard · Testnet
        </p>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export function WalletButton() {
  const { connected, account, wallets, connect, disconnect, isLoading } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (connected && account) {
    return (
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowDropdown(v => !v)} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: pinkDim, border: `1px solid ${pinkDimBorder}`, borderRadius: 999,
          padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: pink,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          {truncate(account.address.toString())}
          <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>▾</span>
        </button>
        {showDropdown && createPortal(
          <>
            <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
            <div style={{
              position: "fixed", top: 68, right: 24, zIndex: 9999, background: bgCard,
              border: `1px solid ${border}`, borderRadius: 14, padding: 8, minWidth: 240,
              boxShadow: "0 8px 32px rgba(44,26,20,0.14)",
            }}>
              <div style={{ padding: "8px 12px 12px", borderBottom: `1px solid ${border}`, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 10, color: textMuted, fontWeight: 600, letterSpacing: "0.06em" }}>CONNECTED WALLET</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: textSecondary, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>
                  {account.address.toString()}
                </p>
              </div>
              <a href={`https://explorer.aptoslabs.com/account/${account.address.toString()}?network=testnet`} target="_blank" rel="noreferrer" onClick={() => setShowDropdown(false)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8,
                textDecoration: "none", color: textSecondary, fontSize: 13,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FFF3FB")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
                🔍 <span>View on Explorer</span>
              </a>
              <button onClick={() => { disconnect(); setShowDropdown(false); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                borderRadius: 8, border: "none", background: "none", color: "#DC2626", fontSize: 13,
                cursor: "pointer", textAlign: "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FFF0F0")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
                ⏏ <span>Disconnect</span>
              </button>
            </div>
          </>,
          document.body
        )}
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} disabled={isLoading} style={{
        display: "flex", alignItems: "center", gap: 7,
        background: pink, border: "none", borderRadius: 999,
        padding: "7px 16px", cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: 600, color: "#fff", opacity: isLoading ? 0.7 : 1, whiteSpace: "nowrap",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-4 0v2" />
        </svg>
        Connect Wallet
      </button>
      {showModal && (
        <WalletModal wallets={(wallets ?? []) as any[]} onClose={() => setShowModal(false)} onConnect={(name) => {
          if (typeof connect === "function") connect(name);
          else console.warn("[Wallet] connect not available for:", name);
        }} />
      )}
    </>
  );
}
