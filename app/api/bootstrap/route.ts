import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-time bootstrap: creates the first admin account from the
// ADMIN_EMAIL / ADMIN_PASSWORD environment variables (same rule as
// prisma/seed.ts). Refuses to run once an admin exists.
// This file is deleted immediately after the admin is created.
export async function GET() {
  const existing = await db.admin.count();
  if (existing > 0)
    return NextResponse.json({ error: "Admin already configured." }, { status: 403 });
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 16 || password.includes("REPLACE_"))
    return NextResponse.json(
      { error: "Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters." },
      { status: 400 },
    );
  await db.admin.create({
    data: { email, name: "Fleet Administrator", passwordHash: await hash(password, 12) },
  });
  return NextResponse.json({ ok: true, email });
}
