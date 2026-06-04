import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Network } from "@aptos-labs/ts-sdk";
import { createDefaultErasureCodingProvider } from "@shelby-protocol/sdk/node";

export const SHELBY_RPC_URL = "https://api.shelbynet.shelby.xyz/shelby";
export const SHELBY_NETWORK = Network.SHELBYNET;
export const DEFAULT_EXPIRATION_MS = 365 * 24 * 60 * 60 * 1_000_000; // 1 year in microseconds

let _provider: Awaited<ReturnType<typeof createDefaultErasureCodingProvider>> | null =
  null;
let _client: ShelbyNodeClient | null = null;

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
