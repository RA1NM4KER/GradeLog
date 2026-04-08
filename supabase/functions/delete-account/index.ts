// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { handleDeleteAccountRequest } from "./handler.ts";

Deno.serve(async (request) => {
  return handleDeleteAccountRequest(request, {
    createClient,
    getEnv: (name) => Deno.env.get(name),
  });
});
