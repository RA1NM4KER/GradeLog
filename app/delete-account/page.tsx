"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSyncConnection } from "@/components/sync/sync-provider";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { deleteAccount, isAuthenticated, isRestoringSession } =
    useSyncConnection();

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const canDeleteAccount = deleteConfirmation.trim() === "DELETE";

  async function handleDeleteAccount() {
    if (!canDeleteAccount) return;

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const result = await deleteAccount();

      if (result.ok) {
        setIsDeleted(true);
      } else {
        setDeleteError(result.errorMessage ?? "Could not delete account.");
      }
    } finally {
      setIsDeletingAccount(false);
    }
  }

  if (isRestoringSession) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-semibold">Delete account</h1>
        <p className="mt-3 text-sm text-ink-muted">
          You need to be signed in to delete your account.
        </p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          Go to GradeLog
        </Button>
      </main>
    );
  }

  if (isDeleted) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-semibold">Account deleted</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Your GradeLog account and all synced data have been permanently
          deleted. Data saved only on this device remains here.
        </p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          Go to GradeLog
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-xl font-semibold">Delete account</h1>
      <p className="mt-3 text-sm leading-6 text-red-800 dark:text-red-200">
        This permanently deletes your GradeLog account, synced devices, shared
        course links, and cloud sync history. Courses saved only on this device
        will stay here.
      </p>

      <div className="mt-6 space-y-2">
        <Label htmlFor="delete-account-confirmation">
          Type DELETE to confirm
        </Label>
        <Input
          id="delete-account-confirmation"
          onChange={(event) => {
            setDeleteConfirmation(event.target.value);
            setDeleteError(null);
          }}
          placeholder="DELETE"
          value={deleteConfirmation}
        />
      </div>

      {deleteError ? (
        <p className="mt-3 text-sm text-red-700 dark:text-red-200">
          {deleteError}
        </p>
      ) : null}

      <div className="mt-4">
        <Button
          disabled={isDeletingAccount || !canDeleteAccount}
          onClick={handleDeleteAccount}
          type="button"
          variant="destructive"
        >
          {isDeletingAccount ? <LoadingSpinner /> : null}
          Delete account
        </Button>
      </div>
    </main>
  );
}
