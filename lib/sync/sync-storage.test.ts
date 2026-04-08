import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage/local-database", () => ({
  APPLIED_OPS_STORE_NAME: "applied_ops",
  ENTITY_VERSIONS_STORE_NAME: "entity_versions",
  PENDING_OPS_STORE_NAME: "pending_ops",
  SYNC_META_STORE_NAME: "sync_meta",
  TOMBSTONES_STORE_NAME: "tombstones",
  withStore: vi.fn(),
}));

vi.mock("@/lib/shared/uuid", () => ({
  createUuid: vi.fn(),
}));

import {
  clearPendingSyncOperations,
  createDefaultSyncMeta,
  deletePendingSyncOperation,
  listPendingSyncOperations,
  loadAppliedSyncOperations,
  loadEntityVersionStates,
  loadLocalTombstones,
  loadSyncMeta,
  markSyncOperationApplied,
  replaceEntityVersionStates,
  replaceLocalTombstones,
  resetLocalSyncState,
  savePendingSyncOperation,
  saveSyncMeta,
} from "@/lib/sync/sync-storage";
import { createUuid } from "@/lib/shared/uuid";
import { withStore } from "@/lib/storage/local-database";
import type {
  AppliedSyncOperationRecord,
  SyncEntityVersionState,
  SyncMetaRecord,
  SyncOperation,
  SyncTombstoneRecord,
} from "@/lib/sync/types";

describe("sync-storage", () => {
  beforeEach(() => {
    vi.mocked(withStore).mockReset();
    vi.mocked(createUuid).mockReset();
    vi.mocked(createUuid).mockReturnValue("device-uuid");
  });

  it("creates and loads sync metadata with defaults", async () => {
    expect(createDefaultSyncMeta()).toMatchObject({
      deviceId: "device-uuid",
      lamportCounter: 0,
      status: "local-only",
      syncEnabled: false,
    });

    vi.mocked(withStore).mockResolvedValueOnce(undefined);
    await expect(loadSyncMeta()).resolves.toMatchObject({
      deviceId: "device-uuid",
      status: "local-only",
      syncEnabled: false,
    });

    vi.mocked(withStore).mockResolvedValueOnce({
      deviceId: "saved-device",
      lamportCounter: 12,
      status: "up-to-date",
      syncEnabled: true,
    } satisfies Partial<SyncMetaRecord>);
    await expect(loadSyncMeta()).resolves.toMatchObject({
      deviceId: "saved-device",
      lamportCounter: 12,
      status: "up-to-date",
      syncEnabled: true,
      connectedUserId: null,
    });
  });

  it("saves and sorts pending operations", async () => {
    const operation: SyncOperation = {
      clientOpId: "op-b",
      deviceId: "device-1",
      entityId: "course-1",
      entityType: "course",
      fieldMask: ["name"],
      lamport: 4,
      opType: "course.update",
      parentEntityId: "semester-1",
      parentEntityType: "semester",
      payload: { semesterId: "semester-1", changes: { name: "Calculus" } },
      serverOrder: null,
    };

    vi.mocked(withStore).mockResolvedValueOnce(operation);
    await expect(savePendingSyncOperation(operation)).resolves.toEqual(
      operation,
    );

    vi.mocked(withStore).mockResolvedValueOnce([
      operation,
      {
        ...operation,
        clientOpId: "op-a",
        lamport: 4,
      },
      {
        ...operation,
        clientOpId: "op-c",
        lamport: 2,
      },
    ]);

    await expect(listPendingSyncOperations()).resolves.toEqual([
      expect.objectContaining({ clientOpId: "op-c", lamport: 2 }),
      expect.objectContaining({ clientOpId: "op-a", lamport: 4 }),
      expect.objectContaining({ clientOpId: "op-b", lamport: 4 }),
    ]);
  });

  it("proxies delete and clear calls to the pending ops store", async () => {
    vi.mocked(withStore).mockResolvedValue(undefined);

    await deletePendingSyncOperation("op-1");
    await clearPendingSyncOperations();

    expect(vi.mocked(withStore)).toHaveBeenNthCalledWith(
      1,
      "pending_ops",
      "readwrite",
      expect.any(Function),
    );
    expect(vi.mocked(withStore)).toHaveBeenNthCalledWith(
      2,
      "pending_ops",
      "readwrite",
      expect.any(Function),
    );

    const deleteRun = vi.mocked(withStore).mock.calls[0]?.[2];
    const clearRun = vi.mocked(withStore).mock.calls[1]?.[2];
    const deleteStore = {
      delete: vi.fn(),
    };
    const clearStore = {
      clear: vi.fn(),
    };

    deleteRun?.(deleteStore as never);
    clearRun?.(clearStore as never);

    expect(deleteStore.delete).toHaveBeenCalledWith("op-1");
    expect(clearStore.clear).toHaveBeenCalled();
  });

  it("loads and replaces tombstones and entity versions", async () => {
    const tombstones: SyncTombstoneRecord[] = [
      { entityId: "course-1", entityType: "course", deletedAtLamport: 4 },
    ];
    const versions: SyncEntityVersionState[] = [
      {
        entityId: "course-1",
        entityType: "course",
        fieldClocks: {},
      },
    ];

    vi.mocked(withStore)
      .mockResolvedValueOnce(tombstones)
      .mockResolvedValueOnce(versions)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(loadLocalTombstones()).resolves.toEqual(tombstones);
    await expect(loadEntityVersionStates()).resolves.toEqual(versions);

    await replaceLocalTombstones(tombstones);
    await replaceEntityVersionStates(versions);

    const replaceTombstonesRun = vi.mocked(withStore).mock.calls[2]?.[2];
    const replaceVersionsRun = vi.mocked(withStore).mock.calls[3]?.[2];

    const tombstoneWrites: string[] = [];
    replaceTombstonesRun?.({
      clear: vi.fn(),
      getAllKeys: vi.fn(),
      put: vi.fn((record, key) => {
        tombstoneWrites.push(key);
        return record;
      }),
    } as never);

    const versionWrites: string[] = [];
    replaceVersionsRun?.({
      clear: vi.fn(),
      getAllKeys: vi.fn(),
      put: vi.fn((record, key) => {
        versionWrites.push(key);
        return record;
      }),
    } as never);

    expect(tombstoneWrites).toEqual(["course:course-1"]);
    expect(versionWrites).toEqual(["course:course-1"]);
  });

  it("loads applied operations, marks operations applied, and resets local sync state", async () => {
    const appliedRecord: AppliedSyncOperationRecord = {
      clientOpId: "op-1",
      appliedAt: "2026-04-08T12:00:00.000Z",
      serverOrder: 4,
    };

    vi.mocked(withStore)
      .mockResolvedValueOnce([appliedRecord])
      .mockResolvedValueOnce(appliedRecord)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        deviceId: "device-uuid",
        lamportCounter: 0,
      });

    await expect(loadAppliedSyncOperations()).resolves.toEqual([appliedRecord]);
    await expect(markSyncOperationApplied(appliedRecord)).resolves.toEqual(
      appliedRecord,
    );
    await expect(resetLocalSyncState()).resolves.toMatchObject({
      deviceId: "device-uuid",
      lamportCounter: 0,
    });
  });

  it("wires store callbacks for sync meta and list/get helpers", async () => {
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
      payload: { semesterId: "semester-1", changes: { name: "Calculus" } },
      serverOrder: null,
    };
    const appliedRecord: AppliedSyncOperationRecord = {
      clientOpId: "op-2",
      appliedAt: "2026-04-08T12:00:00.000Z",
      serverOrder: 7,
    };
    const meta = createDefaultSyncMeta();

    vi.mocked(withStore)
      .mockResolvedValueOnce(meta)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(operation)
      .mockResolvedValueOnce(appliedRecord);

    await loadSyncMeta();
    await listPendingSyncOperations();
    await loadLocalTombstones();
    await loadAppliedSyncOperations();
    await savePendingSyncOperation(operation);
    await markSyncOperationApplied(appliedRecord);

    const loadMetaRun = vi.mocked(withStore).mock.calls[0]?.[2];
    const listPendingRun = vi.mocked(withStore).mock.calls[1]?.[2];
    const loadTombstonesRun = vi.mocked(withStore).mock.calls[2]?.[2];
    const loadAppliedRun = vi.mocked(withStore).mock.calls[3]?.[2];
    const savePendingRun = vi.mocked(withStore).mock.calls[4]?.[2];
    const markAppliedRun = vi.mocked(withStore).mock.calls[5]?.[2];

    const getStore = {
      get: vi.fn(),
      getAll: vi.fn(),
      put: vi.fn(),
    };

    loadMetaRun?.(getStore as never);
    expect(getStore.get).toHaveBeenCalledWith("sync-meta");

    listPendingRun?.(getStore as never);
    loadTombstonesRun?.(getStore as never);
    loadAppliedRun?.(getStore as never);
    expect(getStore.getAll).toHaveBeenCalledTimes(3);

    savePendingRun?.(getStore as never);
    expect(getStore.put).toHaveBeenCalledWith(operation, "op-1");

    markAppliedRun?.(getStore as never);
    expect(getStore.put).toHaveBeenCalledWith(appliedRecord, "op-2");
  });

  it("saves sync metadata through the sync meta store", async () => {
    const meta = {
      ...createDefaultSyncMeta(),
      status: "syncing",
      syncEnabled: true,
    } satisfies SyncMetaRecord;

    vi.mocked(withStore).mockResolvedValueOnce(meta);
    await expect(saveSyncMeta(meta)).resolves.toEqual(meta);

    expect(vi.mocked(withStore)).toHaveBeenCalledWith(
      "sync_meta",
      "readwrite",
      expect.any(Function),
    );
  });
});
