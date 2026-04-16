import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { updateReportStatusSchema } from "@/lib/validators";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Neautorizovaný prístup" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status, note } = updateReportStatusSchema.parse(body);

    const report = await prisma.report.update({
      where: { id },
      data: { status },
      include: { category: true },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "status_change",
        details: { from: report.status, to: status, note },
        reportId: id,
        adminId: session.userId,
      },
    });

    // Add public update if note provided
    if (note) {
      await prisma.reportUpdate.create({
        data: {
          content: note,
          isPublic: true,
          reportId: id,
          authorId: session.userId,
        },
      });
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Aktualizácia zlyhala" }, { status: 500 });
  }
}
