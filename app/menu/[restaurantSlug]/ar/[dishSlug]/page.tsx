import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ARModelViewer } from "@/components/menu/ar-model-viewer";

type Props = {
  params: Promise<{ restaurantSlug: string; dishSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantSlug, dishSlug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("slug", restaurantSlug)
    .eq("is_active", true)
    .single();

  if (!restaurant) return { title: "Not Found" };

  const { data: dish } = await supabase
    .from("dishes")
    .select("name")
    .eq("restaurant_id", restaurant.id)
    .eq("slug", dishSlug)
    .eq("is_available", true)
    .single();

  if (!dish) return { title: "Not Found" };

  return {
    title: `${dish.name} in AR | ${restaurant.name}`,
    description: `Preview ${dish.name} in augmented reality before ordering at ${restaurant.name}.`,
  };
}

export default async function ARPage({ params }: Props) {
  const { restaurantSlug, dishSlug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", restaurantSlug)
    .eq("is_active", true)
    .single();

  if (!restaurant) notFound();

  const { data: dish } = await supabase
    .from("dishes")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("slug", dishSlug)
    .eq("is_available", true)
    .single();

  if (!dish || !dish.model_url) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href={`/menu/${restaurantSlug}`}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#d5d0c4] px-4 text-sm font-semibold text-[#1a1a1a] transition hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <span className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          AR Preview
        </span>
      </div>

      <div className="grid gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Model viewer */}
        <div className="overflow-hidden rounded-2xl border border-[#e8e8e4] bg-white shadow-lg">
          <ARModelViewer
            src={dish.model_url}
            alt={`${dish.name} 3D model`}
            iosSrc={dish.model_ios_url || undefined}
          />
        </div>

        {/* Dish info */}
        <div className="space-y-6 lg:pl-4">
          {dish.image_url && (
            <div className="relative h-40 overflow-hidden rounded-2xl sm:h-52 lg:h-64">
              <Image
                src={dish.image_url}
                alt={dish.name}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <p className="absolute bottom-4 left-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                ${dish.price}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
              {restaurant.name}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl">
              {dish.name}
            </h1>
            {dish.description && (
              <p className="mt-3 text-base leading-7 text-[#666]">
                {dish.description}
              </p>
            )}
            {!dish.image_url && (
              <p className="mt-2 text-2xl font-bold text-orange-500">${dish.price}</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#e8e8e4] bg-white p-4">
            <p className="text-sm text-[#888]">
              On Android 16, use{" "}
              <span className="font-semibold text-[#1a1a1a]">View in AR (Chrome)</span>.
              Scene Viewer may close instantly due to a known Google app issue.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
