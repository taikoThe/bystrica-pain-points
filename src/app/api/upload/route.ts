import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

function hasValidImageSignature(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // WebP: RIFF at [0-3] + WEBP at [8-11]
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return true;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return true;
  // GIF: GIF8
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Žiadny súbor" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Povolené sú len obrázky" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximálna veľkosť súboru je 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!hasValidImageSignature(buffer)) {
      return NextResponse.json({ error: "Neplatný formát súboru" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${randomBytes(16).toString("hex")}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = join(uploadDir, uniqueName);
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch {
    return NextResponse.json({ error: "Nahranie zlyhalo" }, { status: 500 });
  }
}
