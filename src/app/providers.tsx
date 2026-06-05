import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{ network: Network.SHELBYNET }}
      onError={(error) => console.warn("[Wallet] error:", error)}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
