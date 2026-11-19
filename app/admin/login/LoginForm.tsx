"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If credentials accidentally leaked into the URL (e.g. from an old GET submission),
    // immediately purge them from the browser address bar and history for security.
    if (
      typeof window !== "undefined" &&
      (window.location.search.includes("password") ||
        window.location.search.includes("email"))
    ) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <main className="login">
      <form
        className="panel"
        method="POST"
        action="/api/auth/login"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const formData = new FormData(e.currentTarget);
            const r = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(Object.fromEntries(formData)),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Login failed");
            router.push("/admin/dashboard");
            router.refresh();
          } catch (err) {
            setError((err as Error).message);
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
        <button type="submit" className="button" disabled={busy}>
          {busy ? "Signing in…" : "Sign in →"}
        </button>
      </form>
    </main>
  );
}

