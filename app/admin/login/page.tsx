import { redirect } from "next/navigation";
import { admin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await admin();
  if (user) {
    redirect("/admin/dashboard");
  }

  const params = (await searchParams) || {};

  // Security: Immediately purge and reject any sensitive credentials passed via GET query parameters
  if (params?.email || params?.password) {
    redirect(
      "/admin/login" +
        (params.error
          ? `?error=${encodeURIComponent(String(params.error))}`
          : ""),
    );
  }

  const initialError = typeof params?.error === "string" ? params.error : "";
  return <LoginForm initialError={initialError} />;
}
