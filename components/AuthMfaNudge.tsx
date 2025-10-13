// [LABEL: FILE] components/AuthMfaNudge.tsx
"use client";

export default function AuthMfaNudge() {
  return (
    <div className="rounded-lg border p-3 text-sm mt-4">
      <div className="font-medium mb-1">Add extra protection</div>
      <p>Turn on two-factor authentication (TOTP) in your account settings to help prevent account takeover.</p>
    </div>
  );
}
