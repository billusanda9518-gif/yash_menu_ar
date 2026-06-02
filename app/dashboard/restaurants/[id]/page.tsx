"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store, UtensilsCrossed, Grid3X3, Settings, ArrowLeft, ExternalLink, Plus, QrCode,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant, Dish, MenuCategory } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default function RestaurantDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const [restRes, dishRes, catRes] = await Promise.all([
          supabase.from("restaurants").select("*").eq("id", id).single(),
          supabase.from("dishes").select("*").eq("restaurant_id", id).order("sort_order"),
          supabase.from("menu_categories").select("*").eq("restaurant_id", id).order("sort_order"),
        ]);

        if (restRes.error) throw restRes.error;
        setRestaurant(restRes.data);
        setDishes(dishRes.data || []);
        setCategories(catRes.data || []);
      } catch {
        showToast.error("Restaurant not found");
        router.push("/dashboard/restaurants");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!restaurant) return null;

  const quickLinks = [
    { href: `/dashboard/restaurants/${id}/menu`, label: "Menu", icon: UtensilsCrossed, desc: "Manage dishes" },
    { href: `/dashboard/restaurants/${id}/categories`, label: "Categories", icon: Grid3X3, desc: "Organize menu" },
    { href: `/dashboard/restaurants/${id}/qr`, label: "QR Codes", icon: QrCode, desc: "Generate & download" },
    { href: `/dashboard/restaurants/${id}/settings`, label: "Settings", icon: Settings, desc: "Restaurant info" },
  ];

  return (
    <>
      <DashboardHeader
        title={restaurant.name}
        description={restaurant.description || undefined}
        onMenuToggle={() => {}}
      >
        <Link href="/dashboard/restaurants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Menu
          </Button>
        </a>
      </DashboardHeader>

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Status */}
        <div className="flex items-center gap-3">
          <Badge variant={restaurant.is_active ? "success" : "warning"}>
            {restaurant.is_active ? "Active" : "Inactive"}
          </Badge>
          <span className="text-sm text-zinc-400">/{restaurant.slug}</span>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Dishes" value={dishes.length} icon={<UtensilsCrossed className="h-5 w-5" />} />
          <StatsCard title="Categories" value={categories.length} icon={<Grid3X3 className="h-5 w-5" />} />
          <StatsCard title="Views" value={0} icon={<Store className="h-5 w-5" />} />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Manage</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-orange-500/30">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{link.label}</p>
                      <p className="text-sm text-zinc-400">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent dishes */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Dishes</h2>
            <Link href={`/dashboard/restaurants/${id}/menu/new`}>
              <Button variant="ghost" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Dish
              </Button>
            </Link>
          </div>
          {dishes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-400">No dishes yet. Add your first dish!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dishes.slice(0, 6).map((dish) => (
                <div key={dish.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    {dish.image_url ? (
                      <img src={dish.image_url} alt={dish.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600">
                        <UtensilsCrossed className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{dish.name}</p>
                    <p className="text-sm text-orange-400">${dish.price}</p>
                  </div>
                  <Badge variant={dish.is_available ? "success" : "secondary"} size="sm">
                    {dish.is_available ? "Active" : "Hidden"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
