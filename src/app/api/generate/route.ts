import { NextResponse } from "next/server";

const PALETTE = [
  ["#FF6B6B", "#FFE66D"],
  ["#4ECDC4", "#556270"],
  ["#A8E6CF", "#3B2F2F"],
  ["#FF8B94", "#FFDAC1"],
  ["#B5EAD7", "#C7CEEA"],
  ["#E2F0CB", "#FFD3B6"],
  ["#FF9AA2", "#FFB7B2"],
  ["#85E3FF", "#C7CEEA"],
  ["#FFC8A2", "#D4A5A5"],
  ["#9D8CFF", "#C6EAFF"],
];

const MODEL_THEMES: Record<
  string,
  { label: string; accent: string; font: string }
> = {
  ideogram: {
    label: "Ideogram",
    accent: "#7C3AED",
    font: "Georgia, serif",
  },
  "playground-v2.5": {
    label: "Playground v2.5",
    accent: "#0EA5E9",
    font: "system-ui, sans-serif",
  },
  midjourney: {
    label: "Midjourney",
    accent: "#FFFFFF",
    font: "Georgia, serif",
  },
  "stable-diffusion": {
    label: "Stable Diffusion",
    accent: "#F59E0B",
    font: "system-ui, sans-serif",
  },
  sdxl: {
    label: "SDXL",
    accent: "#8B5CF6",
    font: "system-ui, sans-serif",
  },
  flux: {
    label: "Flux",
    accent: "#EC4899",
    font: "system-ui, sans-serif",
  },
};

function resolveModelTheme(model: string) {
  return (
    MODEL_THEMES[model] ?? {
      label: model,
      accent: "#FF6B6B",
      font: "system-ui, sans-serif",
    }
  );
}

function pickPalette(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPlaceholderSvg(
  prompt: string,
  model: string,
  theme: { label: string; accent: string; font: string }
) {
  const [from, to] = pickPalette(prompt + "|" + model);
  const words = prompt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${from}"/>
    <stop offset="100%" stop-color="${to}"/>
  </linearGradient>
  <filter id="glass" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="12"/>
    <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"/>
  </filter>
</defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
<rect x="64" y="64" width="896" height="896" rx="64" fill="white" opacity="0.06"/>
<rect x="72" y="72" width="880" height="880" rx="56"
      fill="none" stroke="${theme.accent}" stroke-width="1.5" opacity="0.35"/>
<text x="512" y="460" text-anchor="middle"
      font-family="${theme.font}" font-size="54" font-weight="700"
      fill="white" opacity="0.95">${escapeXml(words || "ArtVault")}</text>
<text x="512" y="540" text-anchor="middle"
      font-family="${theme.font}" font-size="26"
      fill="white" opacity="0.7">${escapeXml(theme.label)}</text>
<rect x="340" y="600" width="344" height="52" rx="26"
      fill="${theme.accent}" opacity="0.18"/>
<rect x="340" y="600" width="344" height="52" rx="26"
      fill="none" stroke="${theme.accent}" stroke-width="1.5" opacity="0.6"/>
<text x="512" y="632" text-anchor="middle"
      font-family="${theme.font}" font-size="22"
      fill="white" opacity="0.9">${escapeXml(theme.label)}</text>
</svg>`;
}

const IDEOGRAM_API = "https://api.ideogram.ai/generate";

async function callIdeogram(prompt: string): Promise<string> {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) {
    throw new Error(
      "IDEOGRAM_API_KEY is not set. Add it to .env.local to use real Ideogram generations."
    );
  }

  const res = await fetch(IDEOGRAM_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        aspect_ratio: "ASPECT_1_1",
        model: "V_2_TURBO",
      },
    }),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null
        ? data.detail ?? data.error ?? JSON.stringify(data)
        : text;
    throw new Error(`Ideogram API error (${res.status}): ${detail}`);
  }

  const items = data?.data ?? data?.images ?? [];
  const first = Array.isArray(items) ? items[0] : null;
  const imageUrl =
    first?.url ?? first?.image_url ?? first?.src ?? first?.image?.url;

  if (!imageUrl) {
    console.error("[Ideogram] unexpected response shape:", JSON.stringify(data).slice(0, 500));
    throw new Error("Ideogram returned no image URL");
  }

  return imageUrl;
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt: string = body?.prompt;
    const model: string = body?.model || "sdxl";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const theme = resolveModelTheme(model);
    let imageUrl: string;

    if (model === "ideogram") {
      let ideogramUrl: string;
      try {
        ideogramUrl = await callIdeogram(prompt);
      } catch (err) {
        console.error("[Ideogram] generation failed:", err);
        const svg = buildPlaceholderSvg(prompt, model, theme);
        const encoded = Buffer.from(svg).toString("base64");
        imageUrl = `data:image/svg+xml;base64,${encoded}`;
        return NextResponse.json({
          imageUrl,
          prompt,
          model,
          mock: true,
          error: err instanceof Error ? err.message : "Ideogram generation failed",
        });
      }

      // Proxy the image through our server to avoid browser CORS errors
      // when the create page later fetches the bytes for Shelby upload.
      try {
        const imgRes = await fetch(ideogramUrl);
        if (!imgRes.ok)
          throw new Error(
            `Image download failed (HTTP ${imgRes.status})`
          );
        const contentType =
          imgRes.headers.get("content-type") ?? "image/png";
        const buf = Buffer.from(await imgRes.arrayBuffer());
        imageUrl = `data:${contentType};base64,${buf.toString("base64")}`;
      } catch (err) {
        console.error("[Ideogram] image download failed:", err);
        return NextResponse.json(
          {
            error:
              err instanceof Error
                ? err.message
                : "Failed to download generated image",
          },
          { status: 502 }
        );
      }
    } else {
      const svg = buildPlaceholderSvg(prompt, model, theme);
      const encoded = Buffer.from(svg).toString("base64");
      imageUrl = `data:image/svg+xml;base64,${encoded}`;
    }

    return NextResponse.json({ imageUrl, prompt, model, mock: model !== "ideogram" });
  } catch (error) {
    console.error("[/api/generate] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
