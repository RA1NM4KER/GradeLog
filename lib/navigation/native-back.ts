const HOME_URL = "/";

function getCoursesListUrl(url: string) {
  const [pathname, search = ""] = url.split("?");

  if (pathname !== "/courses" || search.length === 0) {
    return null;
  }

  const searchParams = new URLSearchParams(search);

  if (!searchParams.has("course")) {
    return null;
  }

  searchParams.delete("course");

  const nextSearch = searchParams.toString();
  return nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;
}

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
  const fallbackCoursesListUrl = getCoursesListUrl(currentUrl);
  const previousUrl = stack[stack.length - 2] ?? null;

  if (fallbackCoursesListUrl && previousUrl !== fallbackCoursesListUrl) {
    return {
      action: "navigate",
      nextStack: previousUrl
        ? [...stack.slice(0, -1), fallbackCoursesListUrl]
        : [fallbackCoursesListUrl],
      targetUrl: fallbackCoursesListUrl,
    };
  }

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
      targetUrl: previousUrl ?? homeUrl,
    };
  }

  return {
    action: "navigate",
    nextStack: [homeUrl],
    targetUrl: homeUrl,
  };
}
