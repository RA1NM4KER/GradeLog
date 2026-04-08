export const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

import type {
  AdminClient,
  DeleteAccountDeps,
  UserClient,
} from "@/supabase/functions/delete-account/types";

export function jsonResponse(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status,
  });
}

export async function handleDeleteAccountRequest(
  request: Request,
  { createClient, getEnv }: DeleteAccountDeps,
) {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = getEnv("SUPABASE_URL") ?? "";
  const anonKey = getEnv("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(
      { error: "Supabase delete-account function is not configured." },
      500,
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing authorization token." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  }) as UserClient;
  const adminClient = createClient(supabaseUrl, serviceRoleKey) as AdminClient;

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: getUserError,
  } = await userClient.auth.getUser(token);

  if (getUserError || !user) {
    return jsonResponse({ error: "Could not verify your account." }, 401);
  }

  const { error: deleteTemplatesError } = await adminClient
    .from("course_templates")
    .delete()
    .eq("owner_user_id", user.id);

  if (deleteTemplatesError) {
    return jsonResponse(
      { error: "Could not delete shared course links." },
      500,
    );
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteUserError) {
    return jsonResponse({ error: "Could not delete your account." }, 500);
  }

  return jsonResponse({ ok: "true" });
}
