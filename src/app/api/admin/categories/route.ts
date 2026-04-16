import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Neautorizovaný prístup" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        description: data.description || null,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Kategória s týmto názvom alebo slugom už existuje" }, { status: 409 });
    }
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Neplatné údaje", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Vytvorenie kategórie zlyhalo" }, { status: 500 });
  }
}
