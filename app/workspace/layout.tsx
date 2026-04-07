"use client";

import { ReactNode } from "react";

import { CoursesRouteView } from "@/components/workspace/shared/courses-route-view";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  void children;

  return <CoursesRouteView />;
}
