"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader
        title="Analytics"
        description="Track menu views, AR interactions, and QR scans"
        onMenuToggle={() => {}}
      />
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10">
          <BarChart3 className="h-10 w-10 text-orange-400" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">Coming in Phase 2</h2>
        <p className="mt-2 max-w-md text-zinc-400">
          Analytics will help you understand how customers interact with your AR menus — 
          track views, QR scans, popular dishes, and more.
        </p>
      </div>
    </>
  );
}
