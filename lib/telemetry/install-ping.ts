import { APP_STORE_NAME, withStore } from "@/lib/storage/local-database";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import { isNativeApp } from "@/lib/platform/platform";

const INSTALL_ID_KEY = "install-id";

type Platform = "web" | "android" | "ios";

type CapacitorWindow = Window &
  typeof globalThis & {
    Capacitor?: { getPlatform?: () => string };
  };

function getPlatform(): Platform {
  if (!isNativeApp()) return "web";
  const cap = (window as CapacitorWindow).Capacitor;
  const raw = cap?.getPlatform?.() ?? "";
  if (raw === "android") return "android";
  if (raw === "ios") return "ios";
  return "web";
}

async function loadInstallId(): Promise<string | null> {
  try {
    const id = await withStore<string | undefined>(
      APP_STORE_NAME,
      "readonly",
      (store) => store.get(INSTALL_ID_KEY),
    );
    return id ?? null;
  } catch {
    return null;
  }
}

async function saveInstallId(id: string): Promise<void> {
  await withStore(APP_STORE_NAME, "readwrite", (store) =>
    store.put(id, INSTALL_ID_KEY),
  );
}

export async function maybeRecordInstallPing(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const existing = await loadInstallId();
  if (existing) return;

  const installId = crypto.randomUUID();
  await saveInstallId(installId);

  await supabase.rpc("record_install_ping", {
    p_install_id: installId,
    p_platform: getPlatform(),
  });
}
