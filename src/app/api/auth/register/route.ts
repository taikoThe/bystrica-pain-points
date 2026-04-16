import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email je už zaregistrovaný" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email!,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registrácia zlyhala" }, { status: 500 });
  }
}
