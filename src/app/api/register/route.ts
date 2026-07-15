import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { username, email, password } = parsed.data;
  const usernameLower = username.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: usernameLower }] },
  });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    return NextResponse.json(
      { error: `${field} is already taken` },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username: usernameLower,
      email,
      passwordHash,
      lists: {
        create: {
          name: "Watchlist",
          isWatchlist: true,
          description: "Titles you want to watch",
        },
      },
    },
    select: { id: true, username: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
