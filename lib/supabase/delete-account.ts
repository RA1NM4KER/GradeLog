import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/supabase-browser";

export async function deleteCurrentAccount() {
  const client = getSupabaseBrowserClient();

  if (!client || !isSupabaseConfigured()) {
    throw new Error("Account deletion is not configured in this build.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error("Sign in again before deleting your account.");
  }

  const { error } = await client.functions.invoke("delete-account", {
    body: {},
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    throw new Error(
      error.message || "GradeLog could not delete your account right now.",
    );
  }
}
