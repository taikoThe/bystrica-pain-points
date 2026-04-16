import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const loginAttempts = new Map<string, { failures: number; since: number }>();
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const now = Date.now();
    const key = email.toLowerCase();
    const attempts = loginAttempts.get(key);

    if (attempts) {
      if (now - attempts.since > WINDOW_MS) {
        loginAttempts.delete(key);
      } else if (attempts.failures >= MAX_FAILURES) {
        const retryAfter = Math.ceil((attempts.since + WINDOW_MS - now) / 1000);
        return NextResponse.json(
          { error: "Príliš veľa neúspešných pokusov. Skúste znova o 15 minút." },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      const record = loginAttempts.get(key) ?? { failures: 0, since: now };
      loginAttempts.set(key, { failures: record.failures + 1, since: record.since });
      return NextResponse.json({ error: "Nesprávny email alebo heslo" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const record = loginAttempts.get(key) ?? { failures: 0, since: now };
      loginAttempts.set(key, { failures: record.failures + 1, since: record.since });
      return NextResponse.json({ error: "Nesprávny email alebo heslo" }, { status: 401 });
    }

    loginAttempts.delete(key);

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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Prihlásenie zlyhalo" }, { status: 500 });
  }
}
