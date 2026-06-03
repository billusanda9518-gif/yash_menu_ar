"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Store, MoreVertical, Trash2, Pencil, ExternalLink } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@/components/ui/dropdown";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/lib/types";

import { useAuth } from "@/hooks/use-auth";

export default function RestaurantsPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchRestaurants() {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      (async () => {
        await fetchRestaurants();
      })();
    }
  }, [user]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast.success("Restaurant deleted");
      setDeleteTarget(null);
    } catch {
      showToast.error("Failed to delete restaurant");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DashboardHeader
        title="Restaurants"
        description="Manage your restaurants and their menus"
        onMenuToggle={() => {}}
      >
        <Link href="/dashboard/restaurants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        </Link>
      </DashboardHeader>

      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">No restaurants yet</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Create your first restaurant to start building your AR menu.
            </p>
            <Link href="/dashboard/restaurants/new">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Restaurant
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{restaurant.name}</h3>
                      <p className="text-sm text-zinc-500">/{restaurant.slug}</p>
                    </div>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <button className="rounded-lg p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-white group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu align="right">
                      <DropdownItem
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => {
                          window.location.href = `/dashboard/restaurants/${restaurant.id}`;
                        }}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        icon={<ExternalLink className="h-4 w-4" />}
                        onClick={() => {
                          window.open(`/menu/${restaurant.slug}`, "_blank");
                        }}
                      >
                        View Menu
                      </DropdownItem>
                      <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        destructive
                        onClick={() => setDeleteTarget(restaurant)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {restaurant.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                    {restaurant.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Badge variant={restaurant.is_active ? "success" : "secondary"} size="sm">
                    {restaurant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Link
                  href={`/dashboard/restaurants/${restaurant.id}`}
                  className="absolute inset-0 rounded-xl"
                >
                  <span className="sr-only">View {restaurant.name}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Restaurant</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will also
          delete all menus, categories, and dishes. This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
