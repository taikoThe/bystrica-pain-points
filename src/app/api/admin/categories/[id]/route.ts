import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validators";

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
    const data = categorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        description: data.description || null,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Kategória s týmto názvom alebo slugom už existuje" }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Kategória nenájdená" }, { status: 404 });
    }
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Neplatné údaje", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Aktualizácia zlyhala" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Neautorizovaný prístup" }, { status: 403 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { reports: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategória nenájdená" }, { status: 404 });
    }

    if (category._count.reports > 0) {
      return NextResponse.json(
        { error: `Kategóriu nie je možné vymazať — obsahuje ${category._count.reports} hlásení` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Vymazanie zlyhalo" }, { status: 500 });
  }
}
