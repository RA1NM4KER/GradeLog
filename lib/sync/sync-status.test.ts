import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SYNC_STATUS_CONNECTING,
  SYNC_STATUS_ERROR,
  SYNC_STATUS_LOCAL_ONLY,
  SYNC_STATUS_OFFLINE_PENDING,
  SYNC_STATUS_SYNCING,
  SYNC_STATUS_UP_TO_DATE,
} from "@/lib/sync/types";
import { formatLastSyncedAt, getSyncStatusLabel } from "@/lib/sync/sync-status";

describe("sync-status", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the correct status labels", () => {
    expect(getSyncStatusLabel(SYNC_STATUS_CONNECTING)).toBe("Connecting");
    expect(getSyncStatusLabel(SYNC_STATUS_SYNCING)).toBe("Syncing…");
    expect(getSyncStatusLabel(SYNC_STATUS_UP_TO_DATE)).toBe("Up to date");
    expect(getSyncStatusLabel(SYNC_STATUS_OFFLINE_PENDING)).toBe(
      "Offline changes pending",
    );
    expect(getSyncStatusLabel(SYNC_STATUS_ERROR)).toBe("Sync needs attention");
    expect(getSyncStatusLabel(SYNC_STATUS_LOCAL_ONLY)).toBe("Local only");
  });

  it("formats the last sync timestamp into human readable buckets", () => {
    expect(formatLastSyncedAt(null)).toBeNull();
    expect(formatLastSyncedAt(Date.now() - 10_000)).toBe("Synced just now");
    expect(formatLastSyncedAt(Date.now() - 5 * 60_000)).toBe(
      "Synced 5 min ago",
    );
    expect(formatLastSyncedAt(Date.now() - 2 * 60 * 60_000)).toBe(
      "Synced 2 hr ago",
    );
    expect(formatLastSyncedAt(Date.now() - 24 * 60 * 60_000)).toBe(
      "Synced 1 day ago",
    );
    expect(formatLastSyncedAt(Date.now() - 3 * 24 * 60 * 60_000)).toBe(
      "Synced 3 days ago",
    );
  });
});
