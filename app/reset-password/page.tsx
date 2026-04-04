"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearPasswordRecoverySession,
  getCurrentSyncSession,
  hasPasswordRecoverySession,
  signOutFromSync,
  updateCurrentSyncPassword,
} from "@/lib/sync-auth";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [hasCompletedReset, setHasCompletedReset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  useEffect(() => {
    let cancelled = false;

    async function restoreRecoverySession() {
      try {
        const inRecoveryFlow = hasPasswordRecoverySession();
        const session = await getCurrentSyncSession();

        if (cancelled) {
          return;
        }

        setHasRecoverySession(inRecoveryFlow && Boolean(session?.user));

        if (!inRecoveryFlow && session?.user) {
          setErrorMessage(
            "This page only works from a password reset email. Signed-in sessions cannot change the password here.",
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "GradeLog could not verify your password reset link.",
        );
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void restoreRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await updateCurrentSyncPassword(password);

      if (error) {
        throw error;
      }

      clearPasswordRecoverySession();
      await signOutFromSync();
      setHasCompletedReset(true);
      setHasRecoverySession(false);
      setSuccessMessage(
        "Your password has been updated. Sign in again with the new password.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "GradeLog could not update your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center px-4 py-16 sm:px-6">
      <Card className="w-full border border-white/24 bg-white/72 backdrop-blur-sm dark:border-white/10 dark:bg-white/6">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Choose a new password for your connected-devices account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isReady ? (
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Verifying your reset link…
            </p>
          ) : hasCompletedReset ? (
            <div className="grid gap-3">
              <p className="text-sm text-emerald-700">{successMessage}</p>
              <Button asChild type="button" variant="outline">
                <Link href="/">Back to GradeLog</Link>
              </Button>
            </div>
          ) : !hasRecoverySession ? (
            <div className="grid gap-3">
              <p className="text-sm text-rose-700">
                {errorMessage ??
                  "This password reset link is invalid or has expired. Request a new one from the sign-in screen."}
              </p>
              <Button asChild type="button" variant="outline">
                <Link href="/">Back to GradeLog</Link>
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="reset-password">New password</Label>
                <Input
                  autoComplete="new-password"
                  id="reset-password"
                  minLength={8}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-password-confirm">Confirm password</Label>
                <Input
                  autoComplete="new-password"
                  id="reset-password-confirm"
                  minLength={8}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

              <p className="text-sm text-ink-soft">
                Use at least 8 characters.
              </p>

              {!passwordsMatch && confirmPassword.length > 0 ? (
                <p className="text-sm text-rose-700">Passwords do not match.</p>
              ) : null}

              {errorMessage ? (
                <p className="text-sm text-rose-700">{errorMessage}</p>
              ) : null}

              {successMessage ? (
                <p className="text-sm text-emerald-700">{successMessage}</p>
              ) : null}

              <Button
                className={cn(
                  canSubmit
                    ? "border border-stone-300/80 bg-stone-900 text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.28)] hover:bg-stone-800 dark:border-white/14 dark:bg-white/18 dark:text-white dark:hover:bg-white/24"
                    : "border border-white/35 bg-white/82 text-ink-muted shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-white/82 dark:border-white/12 dark:bg-white/10 dark:text-ink-muted dark:hover:bg-white/10",
                )}
                disabled={isSubmitting || !canSubmit}
                type="submit"
                variant="outline"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : null}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
