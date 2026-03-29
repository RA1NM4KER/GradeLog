"use client";

import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WorkspaceBootState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-5xl items-center px-5 py-8 sm:px-8">
      <Card className="w-full max-w-2xl bg-white/85 shadow-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6">
            {description}
          </CardDescription>
        </CardHeader>
        {action ? <CardContent>{action}</CardContent> : null}
      </Card>
    </div>
  );
}
