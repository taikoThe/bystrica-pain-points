import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createReportSchema } from "@/lib/validators";
import { ReportStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") as ReportStatus | null;
  const categoryId = searchParams.get("categoryId");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;

  const reports = await prisma.report.findMany({
    where,
    include: {
      category: true,
      _count: { select: { confirmations: true, attachments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createReportSchema.parse(body);

    const session = await getSession();

    const report = await prisma.report.create({
      data: {
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        latitude: validated.latitude,
        longitude: validated.longitude,
        address: validated.address,
        contactEmail: validated.contactEmail || null,
        isAnonymous: validated.isAnonymous,
        severity: validated.severity,
        userId: session?.userId || null,
        attachments: body.attachments
          ? {
              create: body.attachments.map((url: string) => ({
                url,
                filename: url.split("/").pop() || "photo.jpg",
                mimeType: "image/jpeg",
                size: 0,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        attachments: true,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Neplatné údaje" }, { status: 400 });
    }
    console.error("Create report error:", error);
    return NextResponse.json({ error: "Nepodarilo sa vytvoriť hlásenie" }, { status: 500 });
  }
}
