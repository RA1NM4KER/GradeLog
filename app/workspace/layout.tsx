"use client";

import { ReactNode } from "react";

import { WorkspaceRouteView } from "@/components/workspace/workspace-route-view";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  void children;

  return <WorkspaceRouteView />;
}
