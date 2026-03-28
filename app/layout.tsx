import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Gradeflow",
  description:
    "A calm, premium grade tracker for students who want clarity without clutter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <WorkspaceProvider>
          <AppShell>
            <TopNav />
            {children}
          </AppShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
