"use client";

import { ReactNode } from "react";

import { CoursesRouteView } from "@/components/workspace/shared/courses-route-view";

export default function CoursesLayout({ children }: { children: ReactNode }) {
  void children;

  return <CoursesRouteView />;
}
