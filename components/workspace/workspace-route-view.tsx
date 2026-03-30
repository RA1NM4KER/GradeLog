"use client";

import { useEffect, useState } from "react";

import { ModuleScreen } from "@/components/workspace/module-screen";
import { SemesterScreen } from "@/components/workspace/semester-screen";
import { addWorkspaceNavigationListener } from "@/lib/workspace-navigation";

function readWorkspaceLocation() {
  if (typeof window === "undefined") {
    return {
      moduleId: null,
      pathname: "/workspace",
    };
  }

  const pathname = window.location.pathname;
  const moduleMatch = pathname.match(/^\/workspace\/modules\/([^/]+)$/);

  return {
    moduleId: moduleMatch ? decodeURIComponent(moduleMatch[1]) : null,
    pathname,
  };
}

export function WorkspaceRouteView() {
  const [location, setLocation] = useState(readWorkspaceLocation);

  useEffect(() => {
    const syncLocation = () => {
      setLocation((currentLocation) => {
        const nextLocation = readWorkspaceLocation();

        if (
          currentLocation.pathname === nextLocation.pathname &&
          currentLocation.moduleId === nextLocation.moduleId
        ) {
          return currentLocation;
        }

        return nextLocation;
      });
    };

    return addWorkspaceNavigationListener(syncLocation);
  }, []);

  if (location.moduleId) {
    return <ModuleScreen moduleId={location.moduleId} />;
  }

  return <SemesterScreen />;
}
