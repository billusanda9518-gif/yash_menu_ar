"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, UtensilsCrossed, Trash2, Eye, EyeOff } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Dish, MenuCategory } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default function MenuPage({ params }: Props) {
  const { id: restaurantId } = use(params);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const [dishRes, catRes] = await Promise.all([
          supabase.from("dishes").select("*").eq("restaurant_id", restaurantId).order("sort_order"),
          supabase.from("menu_categories").select("*").eq("restaurant_id", restaurantId).order("sort_order"),
        ]);
        setDishes(dishRes.data || []);
        setCategories(catRes.data || []);
      } catch {
        showToast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [restaurantId]);

  async function toggleAvailability(dish: Dish) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("dishes")
        .update({ is_available: !dish.is_available })
        .eq("id", dish.id);
      if (error) throw error;
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, is_available: !d.is_available } : d))
      );
      showToast.success(dish.is_available ? "Dish hidden from menu" : "Dish now available");
    } catch {
      showToast.error("Failed to update dish");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("dishes").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setDishes((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      showToast.success("Dish deleted");
      setDeleteTarget(null);
    } catch {
      showToast.error("Failed to delete dish");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = activeCategory === "all"
    ? dishes
    : dishes.filter((d) => d.category_id === activeCategory);

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "Uncategorized";
    return categories.find((c) => c.id === catId)?.name || "Unknown";
  };

  return (
    <>
      <DashboardHeader title="Menu" description="Manage your dishes" onMenuToggle={() => {}}>
        <Link href={`/dashboard/restaurants/${restaurantId}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
        <Link href={`/dashboard/restaurants/${restaurantId}/menu/new`}>
          <Button><Plus className="mr-2 h-4 w-4" />Add Dish</Button>
        </Link>
      </DashboardHeader>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Category filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === "all" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            All ({dishes.length})
          </button>
          {categories.map((cat) => {
            const count = dishes.filter((d) => d.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.id ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">No dishes found</h3>
            <p className="mt-2 text-sm text-zinc-400">Add your first dish to this menu.</p>
            <Link href={`/dashboard/restaurants/${restaurantId}/menu/new`}>
              <Button className="mt-4"><Plus className="mr-2 h-4 w-4" />Add Dish</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dish) => (
              <div key={dish.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700">
                {/* Image */}
                <div className="relative aspect-[16/10] bg-zinc-800">
                  {dish.image_url ? (
                    <img src={dish.image_url} alt={dish.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <UtensilsCrossed className="h-8 w-8 text-zinc-600" />
                    </div>
                  )}
                  {dish.is_featured && (
                    <Badge className="absolute left-2 top-2" variant="default" size="sm">Featured</Badge>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{dish.name}</h3>
                      <p className="text-sm text-zinc-500">{getCategoryName(dish.category_id)}</p>
                    </div>
                    <span className="text-lg font-bold text-orange-400">${dish.price}</span>
                  </div>
                  {dish.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{dish.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => toggleAvailability(dish)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        dish.is_available
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {dish.is_available ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {dish.is_available ? "Visible" : "Hidden"}
                    </button>
                    {dish.model_url && (
                      <Badge variant="outline" size="sm">3D Model</Badge>
                    )}
                    <button
                      onClick={() => setDeleteTarget(dish)}
                      className="ml-auto rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Dish</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
