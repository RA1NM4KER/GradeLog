import { afterEach, describe, expect, it, vi } from "vitest";

describe("local-database", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("rejects when IndexedDB is unavailable", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    const { openLocalDatabase } = await import("@/lib/storage/local-database");
    await expect(openLocalDatabase()).rejects.toThrow(
      "IndexedDB is unavailable in this environment.",
    );
  });

  it("opens the database, creates missing stores, and caches the result", async () => {
    const createdStores: string[] = [];
    const database = {
      createObjectStore: vi.fn((storeName: string) => {
        createdStores.push(storeName);
      }),
      objectStoreNames: {
        contains: vi.fn(() => false),
      },
    };
    const request: {
      error: Error | null;
      onerror?: () => void;
      onsuccess?: () => void;
      onupgradeneeded?: () => void;
      result: typeof database;
    } = {
      error: null,
      result: database,
    };
    const open = vi.fn(() => request);

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        indexedDB: { open },
      },
    });

    const localDatabase = await import("@/lib/storage/local-database");
    const firstPromise = localDatabase.openLocalDatabase();
    request.onupgradeneeded?.();
    request.onsuccess?.();
    const firstDatabase = await firstPromise;

    const secondDatabase = await localDatabase.openLocalDatabase();

    expect(firstDatabase).toBe(database);
    expect(secondDatabase).toBe(database);
    expect(open).toHaveBeenCalledTimes(1);
    expect(createdStores).toEqual([
      "app",
      "sync_meta",
      "pending_ops",
      "tombstones",
      "applied_ops",
      "entity_versions",
    ]);
  });

  it("skips creating stores that already exist", async () => {
    const database = {
      createObjectStore: vi.fn(),
      objectStoreNames: {
        contains: vi.fn(() => true),
      },
    };
    const request: {
      error: Error | null;
      onerror?: () => void;
      onsuccess?: () => void;
      onupgradeneeded?: () => void;
      result: typeof database;
    } = {
      error: null,
      result: database,
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        indexedDB: {
          open: vi.fn(() => request),
        },
      },
    });

    const { openLocalDatabase } = await import("@/lib/storage/local-database");
    const databasePromise = openLocalDatabase();
    request.onupgradeneeded?.();
    request.onsuccess?.();
    await databasePromise;

    expect(database.objectStoreNames.contains).toHaveBeenCalledTimes(6);
    expect(database.createObjectStore).not.toHaveBeenCalled();
  });

  it("rejects when opening the database fails", async () => {
    const request: {
      error: Error | null;
      onerror?: () => void;
      onsuccess?: () => void;
      onupgradeneeded?: () => void;
      result: {};
    } = {
      error: new Error("open failed"),
      result: {},
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        indexedDB: {
          open: vi.fn(() => request),
        },
      },
    });

    const { openLocalDatabase } = await import("@/lib/storage/local-database");
    const databasePromise = openLocalDatabase();
    request.onerror?.();
    await expect(databasePromise).rejects.toThrow("open failed");
  });

  it("uses a fallback message when opening the database fails without an error", async () => {
    const request: {
      error: Error | null;
      onerror?: () => void;
      onsuccess?: () => void;
      onupgradeneeded?: () => void;
      result: {};
    } = {
      error: null,
      result: {},
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        indexedDB: {
          open: vi.fn(() => request),
        },
      },
    });

    const { openLocalDatabase } = await import("@/lib/storage/local-database");
    const databasePromise = openLocalDatabase();
    request.onerror?.();
    await expect(databasePromise).rejects.toThrow(
      "Failed to open the GradeLog database.",
    );
  });

  async function loadModuleWithDatabase(database: {
    transaction: ReturnType<typeof vi.fn>;
  }) {
    const openRequest: {
      error: Error | null;
      onerror?: () => void;
      onsuccess?: () => void;
      onupgradeneeded?: () => void;
      result: unknown;
    } = {
      error: null,
      result: null,
    };
    openRequest.result = database;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        indexedDB: {
          open: vi.fn(() => openRequest),
        },
      },
    });

    const localDatabase = await import("@/lib/storage/local-database");
    const openPromise = localDatabase.openLocalDatabase();
    openRequest.onsuccess?.();
    await openPromise;
    return localDatabase;
  }

  it("resolves request results from a completed transaction", async () => {
    const request: {
      error: Error | null;
      onerror?: () => void;
      onsuccess?: () => void;
      result: string;
    } = {
      error: null,
      result: "stored value",
    };
    const transaction: {
      error: Error | null;
      onabort?: () => void;
      oncomplete?: () => void;
      objectStore: ReturnType<typeof vi.fn>;
    } = {
      error: null,
      objectStore: vi.fn(() => ({ name: "app-store" })),
    };
    const localDatabase = await loadModuleWithDatabase({
      transaction: vi.fn(() => transaction),
    });

    const successPromise = localDatabase.withStore(
      "app",
      "readonly",
      () => request as never,
    );
    await Promise.resolve();
    request.onsuccess?.();
    transaction.oncomplete?.();
    await expect(successPromise).resolves.toBe("stored value");
  });

  it("rejects when the IndexedDB request fails", async () => {
    const failedRequest = {
      error: new Error("request failed"),
      onerror: undefined as (() => void) | undefined,
      onsuccess: undefined as (() => void) | undefined,
      result: "ignored",
    };
    const transaction = {
      error: null,
      onabort: undefined as (() => void) | undefined,
      oncomplete: undefined as (() => void) | undefined,
      objectStore: vi.fn(() => ({ name: "app-store" })),
    };
    const localDatabase = await loadModuleWithDatabase({
      transaction: vi.fn(() => transaction),
    });

    const requestErrorPromise = localDatabase.withStore(
      "app",
      "readonly",
      () => failedRequest as never,
    );
    await Promise.resolve();
    failedRequest.onerror?.();
    await expect(requestErrorPromise).rejects.toThrow("request failed");
  });

  it("uses a fallback message when the IndexedDB request fails without an error", async () => {
    const failedRequest = {
      error: null,
      onerror: undefined as (() => void) | undefined,
      onsuccess: undefined as (() => void) | undefined,
      result: "ignored",
    };
    const transaction = {
      error: null,
      onabort: undefined as (() => void) | undefined,
      oncomplete: undefined as (() => void) | undefined,
      objectStore: vi.fn(() => ({ name: "app-store" })),
    };
    const localDatabase = await loadModuleWithDatabase({
      transaction: vi.fn(() => transaction),
    });

    const requestErrorPromise = localDatabase.withStore(
      "app",
      "readonly",
      () => failedRequest as never,
    );
    await Promise.resolve();
    failedRequest.onerror?.();
    await expect(requestErrorPromise).rejects.toThrow(
      "IndexedDB request failed while accessing GradeLog data.",
    );
  });

  it("rejects when the IndexedDB transaction aborts", async () => {
    const abortedRequest = {
      error: null,
      onerror: undefined as (() => void) | undefined,
      onsuccess: undefined as (() => void) | undefined,
      result: "ignored",
    };
    const transaction = {
      error: new Error("transaction aborted"),
      onabort: undefined as (() => void) | undefined,
      oncomplete: undefined as (() => void) | undefined,
      objectStore: vi.fn(() => ({ name: "app-store" })),
    };
    const localDatabase = await loadModuleWithDatabase({
      transaction: vi.fn(() => transaction),
    });

    const abortPromise = localDatabase.withStore(
      "app",
      "readonly",
      () => abortedRequest as never,
    );
    await Promise.resolve();
    transaction.onabort?.();
    await expect(abortPromise).rejects.toThrow("transaction aborted");
  });

  it("uses a fallback message when the IndexedDB transaction aborts without an error", async () => {
    const abortedRequest = {
      error: null,
      onerror: undefined as (() => void) | undefined,
      onsuccess: undefined as (() => void) | undefined,
      result: "ignored",
    };
    const transaction = {
      error: null,
      onabort: undefined as (() => void) | undefined,
      oncomplete: undefined as (() => void) | undefined,
      objectStore: vi.fn(() => ({ name: "app-store" })),
    };
    const localDatabase = await loadModuleWithDatabase({
      transaction: vi.fn(() => transaction),
    });

    const abortPromise = localDatabase.withStore(
      "app",
      "readonly",
      () => abortedRequest as never,
    );
    await Promise.resolve();
    transaction.onabort?.();
    await expect(abortPromise).rejects.toThrow(
      "IndexedDB transaction was aborted while accessing GradeLog data.",
    );
  });

  it("rejects when a transaction completes without a request result", async () => {
    const missingResultRequest = {
      error: null,
      onerror: undefined as (() => void) | undefined,
      onsuccess: undefined as (() => void) | undefined,
      result: "ignored",
    };
    const transaction = {
      error: null,
      onabort: undefined as (() => void) | undefined,
      oncomplete: undefined as (() => void) | undefined,
      objectStore: vi.fn(() => ({ name: "app-store" })),
    };
    const localDatabase = await loadModuleWithDatabase({
      transaction: vi.fn(() => transaction),
    });

    const missingResultPromise = localDatabase.withStore(
      "app",
      "readonly",
      () => missingResultRequest as never,
    );
    await Promise.resolve();
    transaction.oncomplete?.();
    await expect(missingResultPromise).rejects.toThrow(
      "IndexedDB transaction completed without returning a request result.",
    );
  });
});
