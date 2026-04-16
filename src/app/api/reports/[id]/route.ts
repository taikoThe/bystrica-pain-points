import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      category: true,
      user: { select: { id: true, name: true } },
      attachments: true,
      updates: { where: { isPublic: true }, orderBy: { createdAt: "desc" } },
      confirmations: true,
      _count: { select: { confirmations: true } },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Hlásenie nenájdené" }, { status: 404 });
  }

  return NextResponse.json(report);
}

