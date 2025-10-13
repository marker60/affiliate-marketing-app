// [LABEL: FILE] app/auth/new-password/page.tsx
"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewPasswordPage() {
  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    // After clicking the reset link, Supabase sets a session in this tab.
    // We just verify we can proceed.
    (async () => {
      const { data } = await supabase.auth.getSession();
      setReady(!!data.session);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 12) {
      setError("Please use at least 12 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(normalizeAuthError(error.message));
      return;
    }
    setMessage("Password updated! You can close this tab and sign in.");
  }

  if (!ready) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="mt-2 text-sm">
          Opening your secure reset link… If this page doesn’t update, open the link again from your email.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Set a new password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">New password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Use 3–4 random words, 12+ chars"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border p-2 font-medium"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </div>
  );
}

function normalizeAuthError(raw: string) {
  const lower = raw.toLowerCase();
  if (lower.includes("breach") || lower.includes("pwned") || lower.includes("compromised")) {
    return "This password appears in a known breach. Please choose a different, stronger password.";
  }
  if (lower.includes("weak") || lower.includes("policy")) {
    return "Your password doesn’t meet our security policy. Use at least 12 characters and avoid common words.";
  }
  return raw;
}
