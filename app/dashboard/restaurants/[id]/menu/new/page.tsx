"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, UtensilsCrossed, Box } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { createDishSchema } from "@/lib/validations/dish";
import { generateSlug } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import type { MenuCategory } from "@/lib/types";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default function NewDishPage({ params }: Props) {
  const { id: restaurantId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    category_id: "",
    is_available: true,
    is_featured: false,
  });

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order");
      setCategories(data || []);
    }
    fetchCategories();
  }, [restaurantId]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleModelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showToast.error("Model must be under 50MB");
      return;
    }
    setModelFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = createDishSchema.safeParse({
      ...form,
      price: parseFloat(form.price) || 0,
      category_id: form.category_id || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!user) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const slug = generateSlug(form.name);
      let imageUrl = "";
      let modelUrl = "";

      // Upload image
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${restaurantId}/${slug}.${ext}`;
        const { error } = await supabase.storage.from("dish-images").upload(path, imageFile, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("dish-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      // Upload model
      if (modelFile) {
        const ext = modelFile.name.split(".").pop();
        const path = `${restaurantId}/${slug}.${ext}`;
        const { error } = await supabase.storage.from("dish-models").upload(path, modelFile, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("dish-models").getPublicUrl(path);
        modelUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("dishes").insert({
        restaurant_id: restaurantId,
        category_id: form.category_id || null,
        name: form.name,
        slug,
        description: form.description || null,
        price: parseFloat(form.price),
        currency: form.currency,
        image_url: imageUrl || null,
        model_url: modelUrl || null,
        is_available: form.is_available,
        is_featured: form.is_featured,
        sort_order: 0,
      });

      if (error) throw error;
      showToast.success("Dish created!");
      router.push(`/dashboard/restaurants/${restaurantId}/menu`);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to create dish");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DashboardHeader title="Add Dish" description="Add a new dish to your menu" onMenuToggle={() => {}}>
        <Link href={`/dashboard/restaurants/${restaurantId}/menu`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
      </DashboardHeader>

      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Dish Photo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-600">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
              ) : (
                <div className="flex flex-col items-center text-zinc-500">
                  <Upload className="h-8 w-8" />
                  <span className="mt-2 text-sm">Upload dish photo</span>
                  <span className="text-xs text-zinc-600">PNG, JPG, WebP up to 5MB</span>
                </div>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {/* 3D Model upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">3D Model (GLB)</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-600">
              {modelFile ? (
                <div className="flex items-center gap-3 text-green-400">
                  <Box className="h-6 w-6" />
                  <span className="text-sm">{modelFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-zinc-500">
                  <Box className="h-8 w-8" />
                  <span className="mt-2 text-sm">Upload 3D model for AR</span>
                  <span className="text-xs text-zinc-600">GLB format, up to 50MB</span>
                </div>
              )}
              <input type="file" accept=".glb,.gltf" onChange={handleModelChange} className="hidden" />
            </label>
          </div>

          <Input
            label="Dish Name *"
            placeholder="e.g. Margherita Pizza"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            icon={<UtensilsCrossed className="h-4 w-4" />}
          />

          <Input
            label="Description"
            placeholder="Describe the dish..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500"
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500"
              />
              Featured
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Dish</Button>
          </div>
        </form>
      </div>
    </>
  );
}
