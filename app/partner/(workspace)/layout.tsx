import { redirect } from "next/navigation";
import { partner } from "@/lib/partners";
import { PartnerShell } from "@/components/PartnerShell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const agency = await partner();
  if (!agency) redirect("/partner/login");
  return (
    <PartnerShell
      agency={{ name: agency.name, status: agency.status, city: agency.city }}
    >
      {children}
    </PartnerShell>
  );
}
