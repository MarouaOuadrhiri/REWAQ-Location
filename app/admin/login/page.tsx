"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <main className="login">
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error);
            router.push("/admin/dashboard");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        <div className="brand">
          <img src="/brand/rewaq-icon.svg" width="35" height="35" alt="" />
          REWAQ<span>∙</span>
        </div>
        <div className="eyebrow">Administration</div>
        <h1>Welcome back.</h1>
        <p className="muted">Sign in to manage your fleet and reservations.</p>
        <label>
          Email address
          <input type="email" name="email" required autoComplete="username" />
        </label>
        <label style={{ marginTop: 15 }}>
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="button" disabled={busy}>
          {busy ? "Signing in…" : "Sign in →"}
        </button>
      </form>
    </main>
  );
}
