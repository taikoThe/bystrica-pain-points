import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { addUpdateSchema } from "@/lib/validators";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Neautorizovaný prístup" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = addUpdateSchema.parse(body);

    const update = await prisma.reportUpdate.create({
      data: {
        content: validated.content,
        isPublic: validated.isPublic,
        reportId: id,
        authorId: session.userId,
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nepodarilo sa pridať aktualizáciu" }, { status: 500 });
  }
}
