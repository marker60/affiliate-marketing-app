// [LABEL: FILE] app/auth/reset/page.tsx
"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import PasswordTips from "@/components/AuthPasswordTips";

export default function ResetPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const redirect =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/new-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirect,
    });
    setLoading(false);

    if (error) {
      setError(normalizeAuthError(error.message));
      return;
    }
    setMessage("If that email exists, a reset link is on its way.");
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border p-2 font-medium"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <PasswordTips />
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
