import { NextResponse } from "next/server";
import bwipjs from "bwip-js";
import { z } from "zod";

const barcodeQuery = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Barcode text is required.")
    .regex(/^\d+$/, "Barcode text must be numeric."),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = barcodeQuery.safeParse({
    text: searchParams.get("text"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid barcode request." },
      { status: 400 }
    );
  }

  // Server-side SVG generation keeps print scaling consistent across browsers.
  type BwipJsSvgOptions = Parameters<typeof bwipjs.toBuffer>[0];
  const bwipjsWithSvg = bwipjs as typeof bwipjs & {
    toSVG: (options: BwipJsSvgOptions) => string;
  };

  const svg = bwipjsWithSvg.toSVG({
    bcid: "code39",
    text: parsed.data.text,
    scale: 3,
    height: 12,
    includetext: false,
    textxalign: "center",
    paddingwidth: 0,
    paddingheight: 0,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
