import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Network, Account, Ed25519PrivateKey, AccountAddress } from "@aptos-labs/ts-sdk";
import { createDefaultErasureCodingProvider } from "@shelby-protocol/sdk/node";

export const SHELBY_RPC_URL = "https://api.shelbynet.shelby.xyz/shelby";
export const SHELBY_NETWORK = Network.SHELBYNET;
export const DEFAULT_EXPIRATION_MICROS = 365 * 24 * 60 * 60 * 1_000_000; // 1 year

let _provider: Awaited<ReturnType<typeof createDefaultErasureCodingProvider>> | null = null;
let _client: ShelbyNodeClient | null = null;
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function getErasureProvider() {
  if (!_provider) {
    _provider = await createDefaultErasureCodingProvider();
  }
  return _provider;
}

export function getShelbyClient(apiKey?: string): ShelbyNodeClient {
  if (!_client) {
    _client = new ShelbyNodeClient({
      network: SHELBY_NETWORK,
      apiKey,
      rpc: { baseUrl: SHELBY_RPC_URL },
    });
  }
  return _client;
}

export function getServerAccount(): Account {
  const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SHELBY_ACCOUNT_PRIVATE_KEY not configured");
  }
  return Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(privateKey) });
}

export function getAccountAddress(): string {
  const addr = process.env.SHELBY_ACCOUNT_ADDRESS;
  if (!addr) throw new Error("SHELBY_ACCOUNT_ADDRESS not configured");
  return addr;
}
