import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
export const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export const token = () => randomBytes(32).toString("hex");
export async function admin() {
  const value = (await cookies()).get("location_session")?.value;
  if (!value) return null;
  const session = await db.adminSession.findUnique({
    where: { tokenHash: hash(value) },
    include: { admin: true },
  });
  return session && session.expiresAt > new Date() ? session.admin : null;
}
export async function requireAdmin() {
  const user = await admin();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
export async function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const h = await headers();
  if (
    !origin ||
    new URL(origin).host !== (h.get("host") ?? new URL(request.url).host)
  )
    throw new Error("Invalid request origin.");
}
