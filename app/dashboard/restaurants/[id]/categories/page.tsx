"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { MenuCategory } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default function CategoriesPage({ params }: Props) {
  const { id: restaurantId } = use(params);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", sort_order: 0 });

  const fetchCategories = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order");
      if (error) throw error;
      setCategories(data || []);
    } catch {
      showToast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    (async () => {
      await fetchCategories();
    })();
  }, [fetchCategories]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", sort_order: categories.length });
    setDialogOpen(true);
  }

  function openEdit(cat: MenuCategory) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", sort_order: cat.sort_order });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      if (editing) {
        const { error } = await supabase
          .from("menu_categories")
          .update({ name: form.name, description: form.description || null, sort_order: form.sort_order, slug })
          .eq("id", editing.id);
        if (error) throw error;
        showToast.success("Category updated");
      } else {
        const { error } = await supabase
          .from("menu_categories")
          .insert({
            restaurant_id: restaurantId,
            name: form.name,
            slug,
            description: form.description || null,
            sort_order: form.sort_order,
            is_active: true,
          });
        if (error) throw error;
        showToast.success("Category created");
      }
      setDialogOpen(false);
      fetchCategories();
    } catch {
      showToast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("menu_categories").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast.success("Category deleted");
      setDeleteTarget(null);
    } catch {
      showToast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DashboardHeader title="Categories" description="Organize your menu items" onMenuToggle={() => {}}>
        <Link href={`/dashboard/restaurants/${restaurantId}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
      </DashboardHeader>

      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="text" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <p className="text-zinc-400">No categories yet. Create your first category to organize your menu.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <GripVertical className="h-4 w-4 shrink-0 text-zinc-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{cat.name}</p>
                  {cat.description && <p className="text-sm text-zinc-400">{cat.description}</p>}
                </div>
                <span className="text-xs text-zinc-500">Order: {cat.sort_order}</span>
                <button onClick={() => openEdit(cat)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget(cat)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
        <div className="space-y-4 py-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Appetizers" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          <Input label="Sort Order" type="number" value={String(form.sort_order)} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? "Update" : "Create"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Category</DialogTitle>
        <p className="py-4 text-sm text-zinc-400">
          Delete <strong className="text-white">{deleteTarget?.name}</strong>? Dishes in this category will become uncategorized.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
