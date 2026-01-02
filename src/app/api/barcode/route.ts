// app/api/barcode/route.ts
import { NextRequest } from "next/server";
import bwipjs from "bwip-js";

export const runtime = "nodejs"; // bwip-js needs node runtime

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const text = (searchParams.get("text") || "").trim();
  const scale = Number(searchParams.get("scale") || "3");   // bar width multiplier
  const height = Number(searchParams.get("height") || "12"); // barcode height in "bwip units"

  if (!/^(%\$)?\d+$/.test(text)) {
    return new Response("Invalid barcode text. Use %$ prefix or digits only.", {
      status: 400,
    });
  }

  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text,
      scale: Number.isFinite(scale) ? scale : 3,
      height: Number.isFinite(height) ? height : 12,
      includetext: false,
      backgroundcolor: "FFFFFF",
      paddingwidth: 0,
      paddingheight: 0,
    });

    const body = new Uint8Array(png);

    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(`Barcode generation failed: ${e?.message || "unknown error"}`, {
      status: 500,
    });
  }
}
