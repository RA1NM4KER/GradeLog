const HOME_URL = "/";

export interface NativeBackResolution {
  action: "exit" | "navigate";
  nextStack: string[];
  targetUrl: string | null;
}

export function normalizeAppUrl(pathname: string, search?: string) {
  return `${pathname}${search && search.length > 0 ? search : ""}`;
}

export function syncNavigationStack(stack: string[], currentUrl: string) {
  if (stack.length === 0) {
    return [currentUrl];
  }

  const lastUrl = stack[stack.length - 1];

  if (lastUrl === currentUrl) {
    return stack;
  }

  const previousUrl = stack[stack.length - 2];

  if (previousUrl === currentUrl) {
    return stack.slice(0, -1);
  }

  const existingIndex = stack.lastIndexOf(currentUrl);

  if (existingIndex >= 0) {
    return stack.slice(0, existingIndex + 1);
  }

  return [...stack, currentUrl];
}

export function resolveNativeBack(
  stack: string[],
  homeUrl = HOME_URL,
): NativeBackResolution {
  const currentUrl = stack[stack.length - 1] ?? homeUrl;

  if (currentUrl === homeUrl) {
    return {
      action: "exit",
      nextStack: [homeUrl],
      targetUrl: null,
    };
  }

  if (stack.length > 1) {
    return {
      action: "navigate",
      nextStack: stack.slice(0, -1),
      targetUrl: stack[stack.length - 2] ?? homeUrl,
    };
  }

  return {
    action: "navigate",
    nextStack: [homeUrl],
    targetUrl: homeUrl,
  };
}
