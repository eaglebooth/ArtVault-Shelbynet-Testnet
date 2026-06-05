import { NextResponse } from "next/server";
import { getShelbyClient, getAccountAddress } from "@/lib/shelby";
import { AccountAddress } from "@aptos-labs/ts-sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blobName = searchParams.get("blobName");
    if (!blobName) {
      return NextResponse.json(
        { error: "blobName is required" },
        { status: 400 }
      );
    }

    const client = getShelbyClient();
    const address = getAccountAddress();

    const blob = await client.download({
      account: AccountAddress.fromString(address),
      blobName,
    });

    const chunks: Uint8Array[] = [];
    const reader = blob.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value as Uint8Array);
    }

    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    const originalName = blobName.split("/").pop() ?? "download";

    return new NextResponse(combined, {
      headers: {
        "Content-Disposition": `attachment; filename="${originalName}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": combined.length.toString(),
      },
    });
  } catch (error) {
    console.error("[api/download] error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Download failed",
      },
      { status: 500 }
    );
  }
}
