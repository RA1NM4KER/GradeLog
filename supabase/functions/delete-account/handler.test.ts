import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  corsHeaders,
  handleDeleteAccountRequest,
} from "@/supabase/functions/delete-account/handler";

function createRequest(method: string, authorization?: string) {
  return new Request("https://example.com/delete-account", {
    headers: authorization ? { Authorization: authorization } : undefined,
    method,
  });
}

async function readJson(response: Response) {
  return (await response.json()) as Record<string, string>;
}

describe("supabase/functions/delete-account/handler", () => {
  const getEnv = vi.fn<(name: string) => string | undefined>();
  const createClient = vi.fn();

  const userClient = {
    auth: {
      getUser: vi.fn(),
    },
  };

  const deleteEq = vi.fn();
  const adminClient = {
    auth: {
      admin: {
        deleteUser: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: deleteEq,
      })),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    getEnv.mockImplementation((name) => {
      const values: Record<string, string> = {
        SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        SUPABASE_URL: "https://project.supabase.co",
      };

      return values[name];
    });

    createClient
      .mockReturnValueOnce(userClient)
      .mockReturnValueOnce(adminClient);

    userClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    deleteEq.mockResolvedValue({ error: null });
    adminClient.auth.admin.deleteUser.mockResolvedValue({ error: null });
  });

  it("responds to OPTIONS requests with CORS headers", async () => {
    const response = await handleDeleteAccountRequest(
      createRequest("OPTIONS"),
      {
        createClient,
        getEnv,
      },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      corsHeaders["Access-Control-Allow-Origin"],
    );
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects non-POST methods", async () => {
    const response = await handleDeleteAccountRequest(createRequest("GET"), {
      createClient,
      getEnv,
    });

    expect(response.status).toBe(405);
    expect(await readJson(response)).toEqual({
      error: "Method not allowed.",
    });
  });

  it("rejects when the function is not configured", async () => {
    getEnv.mockReturnValue("");

    const response = await handleDeleteAccountRequest(
      createRequest("POST", "Bearer token-123"),
      {
        createClient,
        getEnv,
      },
    );

    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({
      error: "Supabase delete-account function is not configured.",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects when the bearer token is missing", async () => {
    const response = await handleDeleteAccountRequest(createRequest("POST"), {
      createClient,
      getEnv,
    });

    expect(response.status).toBe(401);
    expect(await readJson(response)).toEqual({
      error: "Missing authorization token.",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects when the user cannot be verified", async () => {
    userClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("bad token"),
    });

    const response = await handleDeleteAccountRequest(
      createRequest("POST", "Bearer token-123"),
      {
        createClient,
        getEnv,
      },
    );

    expect(response.status).toBe(401);
    expect(await readJson(response)).toEqual({
      error: "Could not verify your account.",
    });
  });

  it("rejects when deleting shared course links fails", async () => {
    deleteEq.mockResolvedValueOnce({ error: new Error("delete failed") });

    const response = await handleDeleteAccountRequest(
      createRequest("POST", "Bearer token-123"),
      {
        createClient,
        getEnv,
      },
    );

    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({
      error: "Could not delete shared course links.",
    });
  });

  it("rejects when deleting the user fails", async () => {
    adminClient.auth.admin.deleteUser.mockResolvedValueOnce({
      error: new Error("delete user failed"),
    });

    const response = await handleDeleteAccountRequest(
      createRequest("POST", "Bearer token-123"),
      {
        createClient,
        getEnv,
      },
    );

    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({
      error: "Could not delete your account.",
    });
  });

  it("deletes course templates and the user account on success", async () => {
    const response = await handleDeleteAccountRequest(
      createRequest("POST", "Bearer token-123"),
      {
        createClient,
        getEnv,
      },
    );

    expect(createClient).toHaveBeenNthCalledWith(
      1,
      "https://project.supabase.co",
      "anon-key",
      {
        global: {
          headers: {
            Authorization: "Bearer token-123",
          },
        },
      },
    );
    expect(createClient).toHaveBeenNthCalledWith(
      2,
      "https://project.supabase.co",
      "service-role-key",
    );
    expect(userClient.auth.getUser).toHaveBeenCalledWith("token-123");
    expect(adminClient.from).toHaveBeenCalledWith("course_templates");
    expect(deleteEq).toHaveBeenCalledWith("owner_user_id", "user-1");
    expect(adminClient.auth.admin.deleteUser).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ ok: "true" });
  });
});
