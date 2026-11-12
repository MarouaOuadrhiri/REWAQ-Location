"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container section">
      <div className="eyebrow">REWAQ Location</div>
      <h1>We couldn’t load this page.</h1>
      <p>The service may be temporarily unavailable. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
