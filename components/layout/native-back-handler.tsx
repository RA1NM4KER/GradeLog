"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { navigateCourses } from "@/lib/course/courses-navigation";
import {
  normalizeAppUrl,
  resolveNativeBack,
  syncNavigationStack,
} from "@/lib/navigation/native-back";
import { isNativeApp } from "@/lib/platform/platform";

const NATIVE_NAVIGATION_STACK_KEY = "gradelog:native-navigation-stack";

function readNavigationStack() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem(NATIVE_NAVIGATION_STACK_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeNavigationStack(stack: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    NATIVE_NAVIGATION_STACK_KEY,
    JSON.stringify(stack),
  );
}

function navigateTo(url: string, router: ReturnType<typeof useRouter>) {
  if (url.startsWith("/courses") || url.startsWith("/workspace")) {
    navigateCourses(url, { replace: true });
    return;
  }

  router.replace(url);
}

export function NativeBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUrl = normalizeAppUrl(
    pathname,
    searchParams.toString() ? `?${searchParams.toString()}` : "",
  );
  const currentUrlRef = useRef(currentUrl);
  const routerRef = useRef(router);

  currentUrlRef.current = currentUrl;
  routerRef.current = router;

  useEffect(() => {
    if (!isNativeApp()) {
      return;
    }

    const nextStack = syncNavigationStack(readNavigationStack(), currentUrl);
    writeNavigationStack(nextStack);
  }, [currentUrl]);

  useEffect(() => {
    if (!isNativeApp()) {
      return;
    }

    let isMounted = true;
    let removeListener: (() => void) | null = null;

    void import("@capacitor/app")
      .then(async ({ App }) => {
        const listener = await App.addListener("backButton", () => {
          const currentStack = syncNavigationStack(
            readNavigationStack(),
            currentUrlRef.current,
          );
          const resolution = resolveNativeBack(currentStack);

          writeNavigationStack(resolution.nextStack);

          if (resolution.action === "exit") {
            void App.exitApp();
            return;
          }

          if (resolution.targetUrl) {
            navigateTo(resolution.targetUrl, routerRef.current);
          }
        });

        if (!isMounted) {
          await listener.remove();
          return;
        }

        removeListener = () => {
          void listener.remove();
        };
      })
      .catch((error) => {
        console.error("Failed to register native back handler.", error);
      });

    return () => {
      isMounted = false;
      removeListener?.();
    };
  }, []);

  return null;
}
