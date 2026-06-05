import { NextResponse } from "next/server";
import { getShelbyClient, getAccountAddress, DEFAULT_EXPIRATION_MICROS } from "@/lib/shelby";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account, blobName, blobData, totalBytes, imageUrl, prompt, model } = body;

    if (!blobData || !blobName) {
      return NextResponse.json(
        { error: "blobData and blobName are required" },
        { status: 400 }
      );
    }

    let shelbyOk = false;
    let shelbyError: string | null = null;
    let txDigest: string | null = null;

    try {
      const client = getShelbyClient();
      const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("SHELBY_ACCOUNT_PRIVATE_KEY not configured");
      }
      const serverAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(privateKey),
      });

      const binaryString = Buffer.from(blobData, "base64");
      const uint8 = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8[i] = binaryString[i];
      }

      const expirationMicros = Date.now() + DEFAULT_EXPIRATION_MICROS;

      await client.upload({
        blobData: uint8,
        signer: serverAccount,
        blobName,
        expirationMicros,
      });

      shelbyOk = true;
      txDigest = `shelby://${blobName}`;
    } catch (err) {
      console.warn("[api/upload] Shelby upload failed:", err);
      shelbyError = err instanceof Error ? err.message : String(err);
      shelbyOk = false;
    }

    return NextResponse.json({
      ok: true,
      shelbyOk,
      shelbyError,
      txDigest,
      blobName,
      account: account ?? null,
      imageUrl: imageUrl ?? null,
      fallback: !shelbyOk,
      storedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/upload] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
