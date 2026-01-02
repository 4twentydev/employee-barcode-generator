import { ImageResponse } from "next/og";
import { formatEmployeeBarcode, formatEmployeeName } from "@/lib/format";

export const runtime = "edge";

const WIDTH = 900;
const HEIGHT = 600;

const toFilename = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "employee-label";

const toBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return new Response("Missing employee id.", { status: 400 });
  }

  const baseUrl = new URL(request.url);
  baseUrl.pathname = "/";
  baseUrl.search = "";

  const employeeResponse = await fetch(
    new URL(`/api/employees/${id}`, baseUrl),
    { cache: "no-store" }
  );

  if (!employeeResponse.ok) {
    return new Response("Employee not found.", { status: 404 });
  }

  const { employee } = (await employeeResponse.json()) as {
    employee: { name: string; employeeNumber: string };
  };

  const name = formatEmployeeName(employee.name);
  const barcodeValue = formatEmployeeBarcode(employee.employeeNumber);

  const barcodeResponse = await fetch(
    new URL(
      `/api/barcode?text=${encodeURIComponent(barcodeValue)}`,
      baseUrl
    ),
    { cache: "no-store" }
  );

  if (!barcodeResponse.ok) {
    return new Response("Unable to generate barcode.", { status: 500 });
  }

  const barcodeBase64 = toBase64(await barcodeResponse.arrayBuffer());
  const filename = `${toFilename(name)}.png`;

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              letterSpacing: "0.3em",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            Employee
          </div>
          <div
            style={{
              fontSize: "44px",
              fontWeight: 700,
              color: "#111827",
              textAlign: "center",
              maxWidth: "820px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#374151",
            }}
          >
            {barcodeValue}
          </div>
        </div>
        <img
          src={`data:image/png;base64,${barcodeBase64}`}
          alt={`Barcode for ${barcodeValue}`}
          style={{
            width: "760px",
            height: "auto",
          }}
        />
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );

  imageResponse.headers.set("Cache-Control", "no-store");
  imageResponse.headers.set(
    "Content-Disposition",
    `inline; filename="${filename}"`
  );

  return imageResponse;
}
