import { NextResponse } from "next/server";
import { listAssets, saveAsset, deleteAsset } from "@/lib/assets-store";
import type { Asset } from "@/lib/assets-store";

export const runtime = "nodejs";
export async function GET() {
  try {
    const assets = await listAssets();
    return NextResponse.json({ assets });
  } catch (err) {
    console.error("[/api/assets GET] error:", err);
    return NextResponse.json({ assets: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      imageUrl,
      prompt,
      model,
      blobName,
      txDigest,
      shelbyOk,
      account,
    }: Partial<Asset> & { imageUrl?: string } = body ?? {};

    if (!prompt || !model) {
      return NextResponse.json(
        { error: "prompt and model are required" },
        { status: 400 }
      );
    }

    const asset = await saveAsset({
      prompt,
      model,
      blobName: blobName ?? "",
      txDigest: txDigest ?? null,
      shelbyOk: shelbyOk ?? false,
      account: account ?? null,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("[/api/assets] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "id query param is required" },
        { status: 400 }
      );
    }
    const ok = await deleteAsset(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("[/api/assets DELETE] error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete asset",
      },
      { status: 500 }
    );
  }
}
