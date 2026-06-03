"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { createRestaurantSchema } from "@/lib/validations/restaurant";
import { generateSlug } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Upload, Store, Crown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewRestaurantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { plan, limits, canCreateRestaurant, loading: subLoading } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [restaurantCount, setRestaurantCount] = useState<number | null>(null);
  const [atLimit, setAtLimit] = useState(false);

  useEffect(() => {
    async function checkLimit() {
      if (!user) return;
      const supabase = createClient();
      const { count } = await supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);
      const currentCount = count || 0;
      setRestaurantCount(currentCount);
      if (!canCreateRestaurant(currentCount)) {
        setAtLimit(true);
      }
    }
    if (!subLoading && user) {
      checkLimit();
    }
  }, [subLoading, user, canCreateRestaurant]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    website: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" ? { slug: generateSlug(value) } : {}),
    }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Logo must be under 5MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = createRestaurantSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      showToast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      let logoUrl = "";

      if (logoFile) {
        try {
          const ext = logoFile.name.split(".").pop();
          const path = `${user.id}/${form.slug}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("restaurant-logos")
            .upload(path, logoFile, { upsert: true });

          if (uploadError) {
            console.warn("Logo upload failed, creating restaurant without logo:", uploadError.message);
          } else {
            const { data: urlData } = supabase.storage
              .from("restaurant-logos")
              .getPublicUrl(path);
            logoUrl = urlData.publicUrl;
          }
        } catch (uploadErr) {
          console.warn("Logo upload error, continuing without logo:", uploadErr);
        }
      }

      const { data, error } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          address: form.address || null,
          phone: form.phone || null,
          website: form.website || null,
          logo_url: logoUrl || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          showToast.error("A restaurant with this slug already exists");
        } else {
          throw error;
        }
        return;
      }

      showToast.success("Restaurant created!");
      router.push(`/dashboard/restaurants/${data.id}`);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  }

  // ─── Plan Limit Gate ──────────────────────────────────────────────────────
  if (atLimit) {
    return (
      <>
        <DashboardHeader
          title="Create Restaurant"
          description="Add a new restaurant to your account"
          onMenuToggle={() => {}}
        />
        <div className="mx-auto max-w-lg p-4 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <Crown className="h-8 w-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Restaurant limit reached</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Your <Badge variant="secondary" className="mx-1 capitalize">{plan}</Badge> plan allows{" "}
              <span className="font-semibold text-white">{limits.max_restaurants}</span>{" "}
              restaurant{limits.max_restaurants === 1 ? "" : "s"}.
              You currently have <span className="font-semibold text-white">{restaurantCount}</span>.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Upgrade your plan to create more restaurants and unlock premium features.
            </p>
            <Link href="/dashboard/billing">
              <Button className="mt-6">
                Upgrade Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        title="Create Restaurant"
        description="Add a new restaurant to your account"
        onMenuToggle={() => {}}
      />

      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Restaurant Logo
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-8 transition-colors hover:border-zinc-600">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-500">
                  <Upload className="h-8 w-8" />
                  <span className="mt-2 text-sm">Click to upload logo</span>
                  <span className="text-xs text-zinc-600">PNG, JPG, WebP up to 5MB</span>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          </div>

          <Input
            label="Restaurant Name *"
            placeholder="My Restaurant"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            error={errors.name}
            icon={<Store className="h-4 w-4" />}
          />

          <Input
            label="URL Slug *"
            placeholder="my-restaurant"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            error={errors.slug}
            helperText={`Menu URL: /menu/${form.slug || "your-slug"}`}
          />

          <Input
            label="Description"
            placeholder="A brief description of your restaurant"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            error={errors.description}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Address"
              placeholder="123 Main St, City"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 123-4567"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <Input
            label="Website"
            placeholder="https://myrestaurant.com"
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Restaurant
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
