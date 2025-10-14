// [LABEL: FILE] components/AuthPasswordTips.tsx
"use client";

export default function PasswordTips() {
  return (
    <div className="rounded-lg border p-3 text-sm space-y-1">
      <div className="font-medium">Password tips</div>
      <ul className="list-disc ml-5 space-y-1">
        <li>Use at least 12 characters.</li>
        <li>Try a passphrase (e.g., three or four random words).</li>
        <li>Don’t reuse passwords from other sites.</li>
        <li>Consider a password manager.</li>
      </ul>
    </div>
  );
}
