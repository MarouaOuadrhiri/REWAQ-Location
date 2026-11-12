import { redirect } from "next/navigation";
import { admin } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";
export const dynamic = "force-dynamic";
export default async function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await admin();
  if (!user) redirect("/admin/login");
  return <AdminShell name={user.name}>{children}</AdminShell>;
}
