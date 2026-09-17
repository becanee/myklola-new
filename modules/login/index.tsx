"use client";

import { Input } from "@/components/motion/input";
import { securedEncrypt } from "@/lib/encrypter-client";
import { AlertCircle, Loader2, Lock, User } from "lucide-react";
import { useState, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function LoginModule() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const isValid =
    username.trim().length > 0 &&
    password.length > 0 &&
    turnstileToken !== null;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      // Encrypt credentials client-side
      const credentials = securedEncrypt({
        username: username.trim(),
        password,
      });

      const res = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials, turnstile: turnstileToken }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Invalid username or password");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      // Full redirect so Next.js middleware verifies cookies server-side
      window.location.href = json.data?.redirect ?? "/admin";
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && !submitting) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border/40 bg-card p-7">
        {/* Logo + header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <img src="/logo-dashboard.svg" className="w-20" alt="logo" />
            <span className="text-lg font-semibold text-foreground mt-0.5">
              HelpDesk
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <div className="mt-7 space-y-4" onKeyDown={handleKeyDown}>
          <div>
            <div className="mb-1.5">
              <span className="text-sm font-medium text-foreground">
                Username
              </span>
            </div>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={setUsername}
              leftIcon={<User className="size-4 text-muted-foreground" />}
              autoComplete="username"
              disabled={!turnstileToken}
            />
          </div>

          <div>
            <div className="mb-1.5">
              <span className="text-sm font-medium text-foreground">
                Password
              </span>
            </div>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              leftIcon={<Lock className="size-4 text-muted-foreground" />}
              autoComplete="current-password"
              disabled={!turnstileToken}
            />
          </div>

          {/* Turnstile */}
          <div className="flex justify-center [&_iframe]:!min-h-[65px]">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
              onSuccess={setTurnstileToken}
              onError={() => {
                setTurnstileToken(null);
                turnstileRef.current?.reset();
              }}
              options={{
                theme: "light"
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-1.5 rounded-lg bg-destructive/[0.06] px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0B3464] px-5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3464]/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!turnstileToken && !submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting
              ? "Signing in..."
              : !turnstileToken
                ? "Verifying..."
                : "Sign In"}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-7 text-center text-xs text-muted-foreground/50">
          Powered by PT Klola Indonesia
        </p>
      </div>
    </div>
  );
}
