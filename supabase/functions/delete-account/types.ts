export type UserLookupResult = {
  data: {
    user: { id: string } | null;
  };
  error: unknown;
};

export type DeleteTemplatesQuery = {
  eq: (column: string, value: string) => Promise<{ error: unknown }>;
};

export type UserClient = {
  auth: {
    getUser: (token: string) => Promise<UserLookupResult>;
  };
};

export type AdminClient = {
  from: (table: string) => {
    delete: () => DeleteTemplatesQuery;
  };
  auth: {
    admin: {
      deleteUser: (userId: string) => Promise<{ error: unknown }>;
    };
  };
};

export type CreateClient = (
  url: string,
  key: string,
  options?: {
    global?: {
      headers?: Record<string, string>;
    };
  },
) => UserClient | AdminClient;

export type DeleteAccountDeps = {
  createClient: CreateClient;
  getEnv: (name: string) => string | undefined;
};
