import {
  AppState,
  getPersistedAppStateMetadata,
  migrateAppState,
  normalizeAppState,
  PersistedAppStateMetadata,
  toPersistedAppState,
} from "@/lib/app-state";

const DATABASE_NAME = "gradeflow";
const DATABASE_VERSION = 1;
const STORE_NAME = "app";
const APP_STATE_KEY = "app-state";
const APP_STATE_METADATA_KEY = "app-state-metadata";

export interface StoredAppStateRecord {
  metadata: PersistedAppStateMetadata;
  state: AppState;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(
      new Error("IndexedDB is unavailable in this environment."),
    );
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          request.error ?? new Error("Failed to open the GradeLog database."),
        );
      };
    });
  }

  return databasePromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return await new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store_1 = transaction.objectStore(STORE_NAME);
    const request = run(store_1);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ??
          new Error("IndexedDB request failed while accessing GradeLog state."),
      );
    };

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error(
            "IndexedDB transaction was aborted while accessing GradeLog state.",
          ),
      );
    };
  });
}

export async function loadAppStateMetadata(): Promise<PersistedAppStateMetadata | null> {
  const metadata = await withStore("readonly", (store) =>
    store.get(APP_STATE_METADATA_KEY),
  );

  return metadata ? (metadata as PersistedAppStateMetadata) : null;
}

export async function loadAppStateRecord(): Promise<StoredAppStateRecord> {
  const storedState = await withStore("readonly", (store) =>
    store.get(APP_STATE_KEY),
  );
  const state = normalizeAppState(migrateAppState(storedState));
  const metadata =
    (await loadAppStateMetadata()) ?? getPersistedAppStateMetadata(state);

  return {
    metadata,
    state,
  };
}

export async function saveAppState(
  state: AppState,
): Promise<StoredAppStateRecord> {
  const normalizedState = normalizeAppState(state);
  const persistedState = toPersistedAppState(normalizedState);
  const metadata = getPersistedAppStateMetadata(normalizedState);
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error(
            "IndexedDB transaction was aborted while saving GradeLog state.",
          ),
      );
    };

    transaction.onerror = () => {
      reject(
        transaction.error ??
          new Error(
            "IndexedDB transaction failed while saving GradeLog state.",
          ),
      );
    };

    store.put(persistedState, APP_STATE_KEY);
    store.put(metadata, APP_STATE_METADATA_KEY);
  });

  return {
    metadata,
    state: normalizedState,
  };
}
