import { NextResponse } from "next/server";
import { listAssets, saveAsset, deleteAsset } from "@/lib/assets-store";

export const runtime = "nodejs";

export async function GET() {
  const assets = listAssets();
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, prompt, model } = body ?? {};
    if (!imageUrl || !prompt || !model) {
      return NextResponse.json(
        { error: "imageUrl, prompt, and model are required" },
        { status: 400 }
      );
    }
    const asset = saveAsset({ imageUrl, prompt, model });
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
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }
    const ok = deleteAsset(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("[/api/assets DELETE] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete asset" },
      { status: 500 }
    );
  }
}
