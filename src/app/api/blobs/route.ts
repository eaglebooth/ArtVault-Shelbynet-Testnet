import { NextResponse } from "next/server";
import { getShelbyClient } from "@/lib/shelby";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get("account");
    if (!account) {
      return NextResponse.json(
        { error: "account query param is required" },
        { status: 400 }
      );
    }

    const client = getShelbyClient();
    let blobs: any[] = [];

    try {
      const fn = (client as any).getAccountBlobs ?? (client as any).rpc?.getAccountBlobs;
      if (typeof fn === "function") {
        blobs = (await fn({ account })) as any[];
      }
    } catch (err) {
      console.error("[/api/blobs] RPC error:", err);
      blobs = [];
    }

    return NextResponse.json({
      blobs: Array.isArray(blobs) ? blobs : [],
      account,
    });
  } catch (error) {
    console.error("[/api/blobs] error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch blobs",
      },
      { status: 500 }
    );
  }
}
