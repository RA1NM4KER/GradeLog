"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallAppButton({
  className,
  onInstalled,
}: {
  className?: string;
  onInstalled?: () => void;
}) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setPromptEvent(null);
      onInstalled?.();
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [onInstalled]);

  if (isInstalled || !promptEvent) {
    return null;
  }

  return (
    <Button
      className={className}
      disabled={isPrompting}
      onClick={async () => {
        if (!promptEvent) {
          return;
        }

        setIsPrompting(true);

        try {
          await promptEvent.prompt();
          const result = await promptEvent.userChoice;

          if (result.outcome === "accepted") {
            setPromptEvent(null);
            onInstalled?.();
          }
        } finally {
          setIsPrompting(false);
        }
      }}
      type="button"
      variant="outline"
    >
      <Download className="h-4 w-4" />
      Install app
    </Button>
  );
}
