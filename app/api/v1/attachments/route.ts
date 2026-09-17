import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJwtDetailed } from "@/lib/jwt";
import { downloadAttachment } from "@/services/storage";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("_T")?.value;
  if (!token || !(await verifyJwtDetailed(token)).ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!key || key.includes("..") || key.startsWith("/")) {
    return NextResponse.json({ message: "Invalid attachment key" }, { status: 400 });
  }

  try {
    const file = await downloadAttachment(key);
    const extensionIsImage = IMAGE_EXTENSIONS.test(key);
    const contentType = file.contentType || (extensionIsImage ? "image/*" : "application/octet-stream");
    const filename = key.split("/").pop() || "attachment";

    return new NextResponse(file.data as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(file.size),
        "Content-Disposition": `${extensionIsImage ? "inline" : "attachment"}; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("[attachment] Failed to download object:", error);
    return NextResponse.json({ message: "Attachment not found" }, { status: 404 });
  }
}