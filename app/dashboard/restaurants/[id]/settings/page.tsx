"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default function RestaurantSettingsPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", address: "", phone: "", website: "",
  });

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single();
      if (error || !data) { router.push("/dashboard/restaurants"); return; }
      setRestaurant(data);
      setForm({
        name: data.name || "", slug: data.slug || "",
        description: data.description || "", address: data.address || "",
        phone: data.phone || "", website: data.website || "",
      });
      if (data.logo_url) setLogoPreview(data.logo_url);
      setLoading(false);
    }
    fetch();
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { showToast.error("Name is required"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      let logoUrl = restaurant?.logo_url || null;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${restaurant?.owner_id}/${form.slug}.${ext}`;
        await supabase.storage.from("restaurant-logos").upload(path, logoFile, { upsert: true });
        const { data: urlData } = supabase.storage.from("restaurant-logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("restaurants").update({
        name: form.name, slug: form.slug, description: form.description || null,
        address: form.address || null, phone: form.phone || null,
        website: form.website || null, logo_url: logoUrl,
      }).eq("id", id);

      if (error) throw error;
      showToast.success("Settings saved");
    } catch {
      showToast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("restaurants").delete().eq("id", id);
      if (error) throw error;
      showToast.success("Restaurant deleted");
      router.push("/dashboard/restaurants");
    } catch {
      showToast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>;
  }

  return (
    <>
      <DashboardHeader title="Settings" description="Update restaurant information" onMenuToggle={() => {}}>
        <Link href={`/dashboard/restaurants/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
      </DashboardHeader>

      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Logo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-600">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="flex flex-col items-center text-zinc-500">
                  <Upload className="h-8 w-8" /><span className="mt-2 text-sm">Upload logo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
              }} className="hidden" />
            </label>
          </div>

          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />

          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>

        {/* Danger zone */}
        <div className="mt-12 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Deleting this restaurant will permanently remove all menus, dishes, and data.
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />Delete Restaurant
          </Button>
        </div>
      </div>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Restaurant</DialogTitle>
        <DialogDescription>This action is permanent and cannot be undone. All data will be lost.</DialogDescription>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete Forever</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
