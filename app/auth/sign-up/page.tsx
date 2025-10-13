// [LABEL: FILE] app/auth/sign-up/page.tsx
"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import PasswordTips from "@/components/AuthPasswordTips";

export default function SignUpPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 12) {
      setError("Please use at least 12 characters.");
      return;
    }

    // FREE safeguard: HIBP pwned check (server-side API)
    const pwned = await checkPwned(password);
    if (!pwned.ok) {
      setError("Security check temporarily unavailable. Please try again.");
      return;
    }
    if (pwned.compromised) {
      setError(
        "This password appears in a known data breach. Please choose a different, stronger password."
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/confirm`
            : undefined,
      },
    });
    setLoading(false);

    if (error) {
      setError(normalizeAuthError(error.message));
      return;
    }
    setMessage("Check your email to confirm your account.");
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>

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

        <label className="block">
          <span className="text-sm font-medium">Password</span>
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

        <PasswordTips />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border p-2 font-medium"
        >
          {loading ? "Creating…" : "Create account"}
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
    return "This password appears in a known data breach. Please choose a different, stronger password.";
  }
  if (lower.includes("weak") || lower.includes("policy")) {
    return "Your password doesn’t meet our security policy. Use at least 12 characters and avoid common words.";
  }
  return raw;
}

async function checkPwned(password: string): Promise<{ ok: boolean; compromised?: boolean; count?: number }> {
  try {
    const res = await fetch("/api/security/pwned", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    return { ok: !!json.ok, compromised: json.compromised, count: json.count };
  } catch {
    return { ok: false };
  }
}
