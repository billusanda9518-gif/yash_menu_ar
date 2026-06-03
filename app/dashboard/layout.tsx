"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(`[DashboardLayout] Render: user=${user?.email || 'None'}, loading=${loading}`);

  if (loading) {
    console.log("loading started");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  console.log("loading finished");
  console.log("auth state", user);

  if (!user) {
    console.log("redirecting to login");
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Pass sidebarOpen toggle via context-like pattern */}
          <div data-sidebar-toggle="" className="contents">
            {typeof children === "object" && children !== null
              ? /* Clone children with onMenuToggle prop is complex, so we use a simpler approach:
                   The header component receives onMenuToggle directly from the page */
                children
              : children}
          </div>
        </div>
      </main>
    </div>
  );
}
