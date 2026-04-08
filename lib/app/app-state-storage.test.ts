import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/app/app-state", () => ({
  getPersistedAppStateMetadata: vi.fn(),
  migrateAppState: vi.fn(),
  normalizeAppState: vi.fn(),
  toPersistedAppState: vi.fn(),
}));

vi.mock("@/lib/storage/local-database", () => ({
  APP_STORE_NAME: "app",
  openLocalDatabase: vi.fn(),
  withStore: vi.fn(),
}));

import {
  loadAppStateMetadata,
  loadAppStateRecord,
  saveAppState,
} from "@/lib/app/app-state-storage";
import {
  getPersistedAppStateMetadata,
  migrateAppState,
  normalizeAppState,
  toPersistedAppState,
} from "@/lib/app/app-state";
import { openLocalDatabase, withStore } from "@/lib/storage/local-database";
import type {
  AppState,
  PersistedAppStateMetadata,
  StoredAppStateRecord,
} from "@/lib/app/types";

describe("app-state-storage", () => {
  const normalizedState: AppState = {
    selectedSemesterId: "semester-1",
    semesters: [
      {
        id: "semester-1",
        name: "Semester 1",
        periodLabel: "January to June",
        courses: [],
        modules: [],
      },
    ],
  };

  const metadata: PersistedAppStateMetadata = {
    snapshot: '{"semesters":[]}',
    updatedAt: "2026-04-08T12:00:00.000Z",
    version: 3,
  };

  beforeEach(() => {
    vi.mocked(withStore).mockReset();
    vi.mocked(openLocalDatabase).mockReset();
    vi.mocked(migrateAppState).mockReset();
    vi.mocked(normalizeAppState).mockReset();
    vi.mocked(toPersistedAppState).mockReset();
    vi.mocked(getPersistedAppStateMetadata).mockReset();
  });

  it("loads stored metadata when present", async () => {
    vi.mocked(withStore).mockResolvedValueOnce(metadata);

    await expect(loadAppStateMetadata()).resolves.toEqual(metadata);
  });

  it("returns null when no stored metadata exists", async () => {
    vi.mocked(withStore).mockResolvedValueOnce(undefined);

    await expect(loadAppStateMetadata()).resolves.toBeNull();
  });

  it("loads, migrates, normalizes, and derives metadata for state records", async () => {
    const storedState = { semesters: [{ id: "legacy-semester" }] };

    vi.mocked(withStore)
      .mockResolvedValueOnce(storedState)
      .mockResolvedValueOnce(undefined);
    vi.mocked(migrateAppState).mockReturnValueOnce(storedState as never);
    vi.mocked(normalizeAppState).mockReturnValueOnce(normalizedState);
    vi.mocked(getPersistedAppStateMetadata).mockReturnValueOnce(metadata);

    await expect(loadAppStateRecord()).resolves.toEqual<StoredAppStateRecord>({
      metadata,
      state: normalizedState,
    });

    expect(vi.mocked(migrateAppState)).toHaveBeenCalledWith(storedState);
    expect(vi.mocked(normalizeAppState)).toHaveBeenCalledWith(storedState);
    expect(vi.mocked(getPersistedAppStateMetadata)).toHaveBeenCalledWith(
      normalizedState,
    );
  });

  it("prefers stored metadata when it exists", async () => {
    const storedState = { semesters: [] };

    vi.mocked(withStore)
      .mockResolvedValueOnce(storedState)
      .mockResolvedValueOnce(metadata);
    vi.mocked(migrateAppState).mockReturnValueOnce(storedState as never);
    vi.mocked(normalizeAppState).mockReturnValueOnce(normalizedState);

    await expect(loadAppStateRecord()).resolves.toEqual({
      metadata,
      state: normalizedState,
    });
    expect(vi.mocked(getPersistedAppStateMetadata)).not.toHaveBeenCalled();
  });

  it("saves normalized state and metadata through a transaction", async () => {
    const persistedState = { version: 3, semesters: [] };
    vi.mocked(normalizeAppState).mockReturnValueOnce(normalizedState);
    vi.mocked(toPersistedAppState).mockReturnValueOnce(persistedState as never);
    vi.mocked(getPersistedAppStateMetadata).mockReturnValueOnce(metadata);

    const store = {
      put: vi.fn(),
    };
    const transaction: {
      error: Error | null;
      objectStore: ReturnType<typeof vi.fn>;
      onabort?: () => void;
      oncomplete?: () => void;
      onerror?: () => void;
    } = {
      error: null,
      objectStore: vi.fn(() => store),
    };
    const database = {
      transaction: vi.fn(() => transaction),
    };

    vi.mocked(openLocalDatabase).mockResolvedValueOnce(database as never);

    const savePromise = saveAppState(normalizedState);
    await Promise.resolve();
    transaction.oncomplete?.();

    await expect(savePromise).resolves.toEqual({
      metadata,
      state: normalizedState,
    });

    expect(store.put).toHaveBeenNthCalledWith(1, persistedState, "app-state");
    expect(store.put).toHaveBeenNthCalledWith(
      2,
      metadata,
      "app-state-metadata",
    );
  });

  it("rejects when the IndexedDB transaction aborts or errors", async () => {
    vi.mocked(normalizeAppState).mockReturnValue(normalizedState);
    vi.mocked(toPersistedAppState).mockReturnValue({ version: 3 } as never);
    vi.mocked(getPersistedAppStateMetadata).mockReturnValue(metadata);

    const makeTransaction = () => {
      const store = {
        put: vi.fn(),
      };
      const transaction: {
        error: Error | null;
        objectStore: ReturnType<typeof vi.fn>;
        onabort?: () => void;
        oncomplete?: () => void;
        onerror?: () => void;
      } = {
        error: null,
        objectStore: vi.fn(() => store),
      };
      return {
        transaction,
        database: {
          transaction: vi.fn(() => transaction),
        },
      };
    };

    const aborted = makeTransaction();
    vi.mocked(openLocalDatabase).mockResolvedValueOnce(
      aborted.database as never,
    );
    const abortPromise = saveAppState(normalizedState);
    await Promise.resolve();
    aborted.transaction.onabort?.();
    await expect(abortPromise).rejects.toThrow(
      "IndexedDB transaction was aborted while saving GradeLog state.",
    );

    const failed = makeTransaction();
    failed.transaction.error = new Error("write failed");
    vi.mocked(openLocalDatabase).mockResolvedValueOnce(
      failed.database as never,
    );
    const errorPromise = saveAppState(normalizedState);
    await Promise.resolve();
    failed.transaction.onerror?.();
    await expect(errorPromise).rejects.toThrow("write failed");
  });
});
