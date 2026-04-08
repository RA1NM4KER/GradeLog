import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sync/sync-operation-builders", () => ({
  buildBootstrapOperations: vi.fn(),
}));

vi.mock("@/lib/app/app-state", () => ({
  getDefaultAppState: vi.fn(() => ({
    selectedSemesterId: "default-semester",
    semesters: [
      {
        id: "default-semester",
        name: "Semester 1 2026",
        periodLabel: "January to June",
        courses: [],
        modules: [],
      },
    ],
  })),
}));

vi.mock("@/lib/sync/sync-reducer", () => ({
  applyLocalSyncOperation: vi.fn(),
  applyRemoteSyncOperation: vi.fn(),
}));

vi.mock("@/lib/sync/sync-storage", () => ({
  clearPendingSyncOperations: vi.fn(),
  deletePendingSyncOperation: vi.fn(),
  loadAppliedSyncOperations: vi.fn(),
  loadEntityVersionStates: vi.fn(),
  loadLocalTombstones: vi.fn(),
  listPendingSyncOperations: vi.fn(),
  loadSyncMeta: vi.fn(),
  markSyncOperationApplied: vi.fn(),
  replaceEntityVersionStates: vi.fn(),
  replaceLocalTombstones: vi.fn(),
  savePendingSyncOperation: vi.fn(),
  saveSyncMeta: vi.fn(),
}));

vi.mock("@/lib/supabase/supabase-browser", () => ({
  getSupabaseBrowserClient: vi.fn(),
}));

vi.mock("@/lib/platform/platform", () => ({
  isNativeApp: vi.fn(() => false),
}));

import {
  enqueueLocalSyncOperation,
  isAppStateEffectivelyEmpty,
  syncWithServer,
} from "@/lib/sync/sync-engine";
import { buildBootstrapOperations } from "@/lib/sync/sync-operation-builders";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import {
  applyLocalSyncOperation,
  applyRemoteSyncOperation,
} from "@/lib/sync/sync-reducer";
import {
  clearPendingSyncOperations,
  deletePendingSyncOperation,
  listPendingSyncOperations,
  loadEntityVersionStates,
  loadLocalTombstones,
  loadAppliedSyncOperations,
  loadSyncMeta,
  markSyncOperationApplied,
  replaceEntityVersionStates,
  replaceLocalTombstones,
  savePendingSyncOperation,
  saveSyncMeta,
} from "@/lib/sync/sync-storage";
import type { AppState } from "@/lib/app/types";
import type {
  RemoteSyncOperationRow,
  SyncAdapter,
  SyncMetaRecord,
  SyncOperation,
  UploadedOperationRow,
} from "@/lib/sync/types";

function createDefaultLikeState(): AppState {
  return {
    selectedSemesterId: "default-semester",
    semesters: [
      {
        id: "default-semester",
        name: "Semester 1 2026",
        periodLabel: "January to June",
        courses: [],
        modules: [],
      },
    ],
  };
}

function createRichState(): AppState {
  return {
    selectedSemesterId: "semester-1",
    semesters: [
      {
        id: "semester-1",
        name: "Semester 1",
        periodLabel: "January to June",
        courses: [
          {
            id: "course-1",
            code: "MAT101",
            name: "Calculus",
            instructor: "Dr. Maya Patel",
            credits: 16,
            accent: "teal",
            gradeBands: [{ id: "band-1", label: "A", threshold: 80 }],
            assessments: [],
          },
        ],
        modules: [],
      },
    ],
  };
}

function createMeta(): SyncMetaRecord {
  return {
    connectedUserId: null,
    deviceId: "device-1",
    initializedUserId: null,
    lamportCounter: 3,
    lastDeviceSeenAt: null,
    lastPulledServerOrder: null,
    lastSyncedAt: null,
    lastSyncError: null,
    status: "local-only",
    syncEnabled: false,
  };
}

function createRemoteRow(
  overrides?: Partial<RemoteSyncOperationRow>,
): RemoteSyncOperationRow {
  return {
    client_op_id: "remote-op-1",
    created_at: "2026-04-08T12:00:00.000Z",
    device_id: "device-remote",
    entity_id: "course-1",
    entity_type: "course",
    field_mask: ["name"],
    id: 1,
    lamport: 2,
    op_type: "course.update",
    parent_entity_id: "semester-1",
    parent_entity_type: "semester",
    payload: {
      semesterId: "semester-1",
      changes: { name: "Calculus Updated" },
    },
    server_order: 12,
    user_id: "user-1",
    ...overrides,
  };
}

function createUploadedRow(
  overrides?: Partial<UploadedOperationRow>,
): UploadedOperationRow {
  return {
    client_op_id: "op-1",
    id: 44,
    server_order: 18,
    ...overrides,
  };
}

function createQueryResult<T>(result: { data: T; error: Error | null }) {
  const query = {
    eq: vi.fn(() => query),
    gt: vi.fn(() => query),
    limit: vi.fn(() => query),
    order: vi.fn(() => query),
    then: (resolve: (value: typeof result) => unknown) =>
      Promise.resolve(resolve(result)),
  };

  return query;
}

function createSupabaseClient(options?: {
  remoteFetches?: RemoteSyncOperationRow[][];
  uploadedRows?: UploadedOperationRow[];
  remoteFetchError?: Error | null;
  userDeviceError?: Error | null;
  syncDeleteError?: Error | null;
  tombstoneDeleteError?: Error | null;
  tombstoneUpsertError?: Error | null;
}) {
  const remoteFetches = [...(options?.remoteFetches ?? [])];
  const uploadedRows = options?.uploadedRows ?? [];

  return {
    from(table: string) {
      if (table === "user_devices") {
        return {
          upsert: vi.fn(async () => ({
            error: options?.userDeviceError ?? null,
          })),
        };
      }

      if (table === "sync_operations") {
        return {
          delete: vi.fn(() => ({
            eq: vi.fn(async () => ({
              error: options?.syncDeleteError ?? null,
            })),
          })),
          select: vi.fn(() =>
            createQueryResult({
              data: remoteFetches.shift() ?? [],
              error: options?.remoteFetchError ?? null,
            }),
          ),
          upsert: vi.fn(() => ({
            select: vi.fn(async () => ({ data: uploadedRows, error: null })),
          })),
        };
      }

      if (table === "entity_tombstones") {
        return {
          delete: vi.fn(() => ({
            eq: vi.fn(async () => ({
              error: options?.tombstoneDeleteError ?? null,
            })),
          })),
          upsert: vi.fn(async () => ({
            error: options?.tombstoneUpsertError ?? null,
          })),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };
}

describe("sync-engine", () => {
  beforeEach(() => {
    vi.mocked(buildBootstrapOperations).mockReset();
    vi.mocked(loadEntityVersionStates).mockReset();
    vi.mocked(loadLocalTombstones).mockReset();
    vi.mocked(applyLocalSyncOperation).mockReset();
    vi.mocked(applyRemoteSyncOperation).mockReset();
    vi.mocked(clearPendingSyncOperations).mockReset();
    vi.mocked(deletePendingSyncOperation).mockReset();
    vi.mocked(listPendingSyncOperations).mockReset();
    vi.mocked(loadAppliedSyncOperations).mockReset();
    vi.mocked(savePendingSyncOperation).mockReset();
    vi.mocked(saveSyncMeta).mockReset();
    vi.mocked(loadSyncMeta).mockReset();
    vi.mocked(markSyncOperationApplied).mockReset();
    vi.mocked(replaceEntityVersionStates).mockReset();
    vi.mocked(replaceLocalTombstones).mockReset();
    vi.mocked(getSupabaseBrowserClient).mockReset();
    vi.mocked(loadEntityVersionStates).mockResolvedValue([]);
    vi.mocked(loadLocalTombstones).mockResolvedValue([]);
    vi.mocked(loadAppliedSyncOperations).mockResolvedValue([]);
    vi.mocked(listPendingSyncOperations).mockResolvedValue([]);
    vi.mocked(savePendingSyncOperation).mockResolvedValue(undefined);
    vi.mocked(saveSyncMeta).mockResolvedValue(createMeta());
    vi.mocked(loadSyncMeta).mockResolvedValue(createMeta());
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(null);
    vi.mocked(markSyncOperationApplied).mockResolvedValue({
      clientOpId: "op-1",
      serverOrder: 1,
    });
    vi.mocked(deletePendingSyncOperation).mockResolvedValue(undefined);
    vi.mocked(clearPendingSyncOperations).mockResolvedValue(undefined);
    vi.mocked(replaceEntityVersionStates).mockResolvedValue(undefined);
    vi.mocked(replaceLocalTombstones).mockResolvedValue(undefined);
  });

  it("detects when app state is effectively empty", () => {
    expect(isAppStateEffectivelyEmpty(createDefaultLikeState())).toBe(true);
    expect(
      isAppStateEffectivelyEmpty({
        ...createDefaultLikeState(),
        semesters: [],
      }),
    ).toBe(true);
    expect(isAppStateEffectivelyEmpty(createRichState())).toBe(false);
    expect(
      isAppStateEffectivelyEmpty({
        ...createDefaultLikeState(),
        semesters: [
          {
            ...createDefaultLikeState().semesters[0]!,
            name: "Custom Semester",
          },
        ],
      }),
    ).toBe(false);
  });

  it("enqueues a local sync operation and sets status from auth and connectivity", async () => {
    const operation: SyncOperation = {
      clientOpId: "op-1",
      deviceId: "device-1",
      entityId: "course-1",
      entityType: "course",
      fieldMask: ["name"],
      lamport: 4,
      opType: "course.update",
      parentEntityId: "semester-1",
      parentEntityType: "semester",
      payload: {
        semesterId: "semester-1",
        changes: { name: "Calculus I" },
      },
      serverOrder: null,
    };
    const context = {
      entityVersions: new Map(),
      tombstones: new Map(),
    };
    const applied = {
      context,
      didApply: true,
      reason: "applied" as const,
      state: createRichState(),
    };

    vi.mocked(applyLocalSyncOperation).mockReturnValue(applied);

    const result = await enqueueLocalSyncOperation(
      createRichState(),
      operation,
      createMeta(),
      {
        isAuthenticated: true,
        isOnline: false,
      },
    );

    expect(result).toBe(applied);
    expect(vi.mocked(savePendingSyncOperation)).toHaveBeenCalledWith(operation);
    expect(vi.mocked(saveSyncMeta)).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "offline-pending",
      }),
    );
  });

  it("handles the early-return syncWithServer branches", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: null,
    });
    expect(setStatus).toHaveBeenCalledWith("local-only");

    setStatus.mockClear();
    await syncWithServer({
      adapter,
      isOnline: false,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });
    expect(setStatus).toHaveBeenCalledWith("offline-pending");

    setStatus.mockClear();
    await syncWithServer({
      adapter: {
        ...adapter,
        getAppState: vi.fn(() => null),
      },
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });
    expect(setStatus).not.toHaveBeenCalled();
  });

  it("surfaces sync errors through the status and error callbacks", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(setStatus).toHaveBeenNthCalledWith(1, "syncing");
    expect(setStatus).toHaveBeenNthCalledWith(2, "error");
    expect(setErrorMessage).toHaveBeenCalledWith("Supabase is not configured.");
    expect(setStatusNotice).toHaveBeenCalledWith(null);
  });

  it("bootstraps remote sync from local data for a newly connected user", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };
    const bootstrapOperation: SyncOperation = {
      clientOpId: "op-1",
      deviceId: "device-1",
      entityId: "semester-1",
      entityType: "semester",
      fieldMask: ["name", "periodLabel"],
      lamport: 4,
      opType: "semester.create",
      parentEntityId: null,
      parentEntityType: null,
      payload: {
        semester: {
          id: "semester-1",
          name: "Semester 1",
          periodLabel: "January to June",
        },
      },
      serverOrder: null,
    };

    vi.mocked(buildBootstrapOperations).mockReturnValue({
      nextMeta: {
        ...createMeta(),
        lamportCounter: 4,
      },
      operations: [bootstrapOperation],
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [[]],
        uploadedRows: [
          createUploadedRow({ client_op_id: "op-1", server_order: 20 }),
        ],
      }) as never,
    );
    vi.mocked(listPendingSyncOperations)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(vi.mocked(buildBootstrapOperations)).toHaveBeenCalled();
    expect(vi.mocked(clearPendingSyncOperations)).toHaveBeenCalled();
    expect(setStatus).toHaveBeenLastCalledWith("up-to-date");
    expect(setStatusNotice).toHaveBeenCalledWith(
      "This device is now connected.",
    );
    expect(vi.mocked(saveSyncMeta)).toHaveBeenCalledWith(
      expect.objectContaining({
        initializedUserId: "user-1",
        lastPulledServerOrder: 20,
      }),
    );
    expect(setErrorMessage).toHaveBeenCalledWith(null);
  });

  it("pulls remote state into an empty local device during first-time connection", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createDefaultLikeState()),
    };
    const pulledState = createRichState();

    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [[createRemoteRow()], []],
      }) as never,
    );
    vi.mocked(applyRemoteSyncOperation).mockReturnValue({
      context: {
        entityVersions: new Map(),
        tombstones: new Map(),
      },
      didApply: true,
      reason: "applied",
      state: pulledState,
    });
    vi.mocked(listPendingSyncOperations)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(adapter.applyRemoteState).toHaveBeenCalledWith(pulledState);
    expect(vi.mocked(markSyncOperationApplied)).toHaveBeenCalledWith({
      clientOpId: "remote-op-1",
      serverOrder: 12,
    });
    expect(setStatusNotice).toHaveBeenCalledWith(
      "Your grades are now in sync on this device.",
    );
    expect(setStatus).toHaveBeenLastCalledWith("up-to-date");
  });

  it("uploads pending operations, applies pulled conflicts, and keeps syncing when work remains", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };
    const pendingOperation: SyncOperation = {
      clientOpId: "pending-op-1",
      deviceId: "device-1",
      entityId: "course-1",
      entityType: "course",
      fieldMask: ["name"],
      lamport: 4,
      opType: "course.update",
      parentEntityId: "semester-1",
      parentEntityType: "semester",
      payload: {
        semesterId: "semester-1",
        changes: { name: "Calculus I" },
      },
      serverOrder: null,
    };

    vi.mocked(loadSyncMeta).mockResolvedValue({
      ...createMeta(),
      connectedUserId: "user-1",
      initializedUserId: "user-1",
      lastPulledServerOrder: 10,
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [
          [createRemoteRow({ client_op_id: "remote-op-2", server_order: 30 })],
        ],
        uploadedRows: [
          createUploadedRow({ client_op_id: "pending-op-1", server_order: 25 }),
        ],
      }) as never,
    );
    vi.mocked(listPendingSyncOperations)
      .mockResolvedValueOnce([pendingOperation])
      .mockResolvedValueOnce([pendingOperation]);
    vi.mocked(applyRemoteSyncOperation).mockReturnValue({
      context: {
        entityVersions: new Map(),
        tombstones: new Map(),
      },
      didApply: false,
      reason: "entity-deleted",
      state: createRichState(),
    });

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(vi.mocked(deletePendingSyncOperation)).toHaveBeenCalledWith(
      "pending-op-1",
    );
    expect(vi.mocked(markSyncOperationApplied)).toHaveBeenCalledWith({
      clientOpId: "pending-op-1",
      serverOrder: 25,
    });
    expect(setStatusNotice).toHaveBeenCalledWith(
      "One change was skipped because the item was deleted on another device.",
    );
    expect(setStatus).toHaveBeenLastCalledWith("syncing");
  });

  it("replaces remote data when a connected user already has conflicting remote history", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };
    const bootstrapOperation: SyncOperation = {
      clientOpId: "op-replace",
      deviceId: "device-1",
      entityId: "semester-1",
      entityType: "semester",
      fieldMask: ["name", "periodLabel"],
      lamport: 5,
      opType: "semester.create",
      parentEntityId: null,
      parentEntityType: null,
      payload: {
        semester: {
          id: "semester-1",
          name: "Semester 1",
          periodLabel: "January to June",
        },
      },
      serverOrder: null,
    };

    vi.mocked(buildBootstrapOperations).mockReturnValue({
      nextMeta: {
        ...createMeta(),
        lamportCounter: 5,
      },
      operations: [bootstrapOperation],
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [[createRemoteRow()]],
        uploadedRows: [
          createUploadedRow({ client_op_id: "op-replace", server_order: 40 }),
        ],
      }) as never,
    );
    vi.mocked(listPendingSyncOperations)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(vi.mocked(clearPendingSyncOperations)).toHaveBeenCalled();
    expect(setStatusNotice).toHaveBeenCalledWith(
      "This device is now connected. Existing grades on this device were kept for sync.",
    );
    expect(setStatus).toHaveBeenLastCalledWith("up-to-date");
  });

  it("recovers from a lost local cursor by replaying the remote log", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };

    vi.mocked(loadSyncMeta).mockResolvedValue({
      ...createMeta(),
      connectedUserId: "user-1",
      initializedUserId: "user-1",
      lastPulledServerOrder: null,
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [
          [createRemoteRow({ client_op_id: "remote-op-3", server_order: 31 })],
        ],
      }) as never,
    );
    vi.mocked(applyRemoteSyncOperation).mockReturnValue({
      context: {
        entityVersions: new Map(),
        tombstones: new Map(),
      },
      didApply: false,
      reason: "parent-deleted",
      state: createRichState(),
    });
    vi.mocked(listPendingSyncOperations)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(setStatusNotice).toHaveBeenCalledWith(
      "One change was skipped because the item was deleted on another device.",
    );
    expect(setStatus).toHaveBeenLastCalledWith("up-to-date");
  });

  it("reports plural conflict notices when multiple pulled changes were skipped", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };

    vi.mocked(loadSyncMeta).mockResolvedValue({
      ...createMeta(),
      connectedUserId: "user-1",
      initializedUserId: "user-1",
      lastPulledServerOrder: 10,
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [
          [
            createRemoteRow({ client_op_id: "remote-op-4", server_order: 32 }),
            createRemoteRow({ client_op_id: "remote-op-5", server_order: 33 }),
          ],
        ],
      }) as never,
    );
    vi.mocked(listPendingSyncOperations)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    vi.mocked(applyRemoteSyncOperation).mockReturnValue({
      context: {
        entityVersions: new Map(),
        tombstones: new Map(),
      },
      didApply: false,
      reason: "entity-deleted",
      state: createRichState(),
    });

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(setStatusNotice).toHaveBeenCalledWith(
      "2 changes were skipped because those items were deleted on another device.",
    );
  });

  it("surfaces errors from remote cleanup and fetch paths", async () => {
    const setStatus = vi.fn(() => Promise.resolve());
    const setErrorMessage = vi.fn();
    const setStatusNotice = vi.fn();
    const adapter: SyncAdapter = {
      applyRemoteState: vi.fn(),
      getAppState: vi.fn(() => createRichState()),
    };

    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [[createRemoteRow()]],
        tombstoneDeleteError: new Error("tombstone cleanup failed"),
      }) as never,
    );

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(setErrorMessage).toHaveBeenCalledWith("tombstone cleanup failed");
    expect(setStatus).toHaveBeenLastCalledWith("error");

    setStatus.mockClear();
    setErrorMessage.mockClear();
    setStatusNotice.mockClear();

    vi.mocked(loadSyncMeta).mockResolvedValue({
      ...createMeta(),
      connectedUserId: "user-1",
      initializedUserId: "user-1",
      lastPulledServerOrder: null,
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(
      createSupabaseClient({
        remoteFetches: [[]],
        remoteFetchError: new Error("remote fetch failed"),
      }) as never,
    );

    await syncWithServer({
      adapter,
      isOnline: true,
      setErrorMessage,
      setStatusNotice,
      setStatus,
      userId: "user-1",
    });

    expect(setErrorMessage).toHaveBeenCalledWith("remote fetch failed");
    expect(setStatus).toHaveBeenLastCalledWith("error");
  });
});
