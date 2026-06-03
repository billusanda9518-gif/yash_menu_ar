"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, UtensilsCrossed, Grid3X3, Eye, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ restaurants: 0, dishes: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const supabase = createClient();
        
        // 1. Get user's restaurants
        const { data: userRestaurants, error: rErr } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", user.id);
        
        if (rErr) throw rErr;
        
        const restaurantCount = userRestaurants?.length || 0;
        let dishCount = 0;
        let categoryCount = 0;
        
        if (restaurantCount > 0) {
          const restaurantIds = userRestaurants.map((r) => r.id);
          
          const [dishRes, categoryRes] = await Promise.all([
            supabase
              .from("dishes")
              .select("id", { count: "exact", head: true })
              .in("restaurant_id", restaurantIds),
            supabase
              .from("menu_categories")
              .select("id", { count: "exact", head: true })
              .in("restaurant_id", restaurantIds),
          ]);
          
          dishCount = dishRes.count || 0;
          categoryCount = categoryRes.count || 0;
        }

        setStats({
          restaurants: restaurantCount,
          dishes: dishCount,
          categories: categoryCount,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <>
      <DashboardHeader
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description="Here's an overview of your restaurants"
        onMenuToggle={() => {}}
      />

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))
          ) : (
            <>
              <StatsCard
                title="Restaurants"
                value={stats.restaurants}
                icon={<Store className="h-5 w-5" />}
              />
              <StatsCard
                title="Total Dishes"
                value={stats.dishes}
                icon={<UtensilsCrossed className="h-5 w-5" />}
              />
              <StatsCard
                title="Categories"
                value={stats.categories}
                icon={<Grid3X3 className="h-5 w-5" />}
              />
              <StatsCard
                title="Total Views"
                value={0}
                icon={<Eye className="h-5 w-5" />}
                trend="Coming in Phase 2"
              />
            </>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/restaurants/new">
              <div className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-orange-500/30 hover:bg-zinc-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-white">Create Restaurant</p>
                  <p className="text-sm text-zinc-400">Add a new restaurant to your account</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/restaurants">
              <div className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-orange-500/30 hover:bg-zinc-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-white">Manage Restaurants</p>
                  <p className="text-sm text-zinc-400">View and edit your restaurants</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Empty state for no restaurants */}
        {!loading && stats.restaurants === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">No restaurants yet</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Get started by creating your first restaurant and adding your menu.
            </p>
            <Link href="/dashboard/restaurants/new">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Restaurant
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
