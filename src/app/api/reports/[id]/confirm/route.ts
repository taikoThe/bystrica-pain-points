import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createHash } from "crypto";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Hlásenie nenájdené" }, { status: 404 });
  }

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

  try {
    if (session?.userId) {
      await prisma.confirmation.create({
        data: {
          reportId: id,
          userId: session.userId,
          ipHash,
        },
      });
    } else {
      await prisma.confirmation.create({
        data: {
          reportId: id,
          ipHash,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Už ste toto hlásenie potvrdili" }, { status: 409 });
  }
}
