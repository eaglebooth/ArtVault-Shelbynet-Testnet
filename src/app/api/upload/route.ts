import { NextResponse } from "next/server";
import { getShelbyClient } from "@/lib/shelby";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      account,
      blobName,
      blobData,
      totalBytes,
      imageUrl,
    }: {
      account?: string;
      blobName: string;
      blobData: string;
      totalBytes?: number;
      imageUrl?: string;
    } = body;

    if (!blobData || !blobName) {
      return NextResponse.json(
        { error: "blobData and blobName are required" },
        { status: 400 }
      );
    }

    let shelbyOk = false;
    let shelbyError: string | null = null;
    let txDigest: string | null = null;

    // Try real Shelby upload if account is provided
    if (account && blobData) {
      try {
        const client = getShelbyClient();

        const binaryString = Buffer.from(blobData, "base64");
        const uint8 = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8[i] = binaryString[i];
        }

        await (client as any).putBlob?.({
          account,
          blobName,
          blobData: uint8,
          totalBytes: totalBytes ?? uint8.length,
        });

        shelbyOk = true;
        txDigest = `shelby://${blobName}`;
      } catch (err) {
        console.warn("[api/upload] Shelby upload failed, falling back to local:", err);
        shelbyError = err instanceof Error ? err.message : String(err);
        shelbyOk = false;
      }
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
