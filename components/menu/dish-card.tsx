import Image from "next/image";
import Link from "next/link";
import { View } from "lucide-react";
import type { Dish } from "@/lib/types";

type Props = {
  dish: Dish;
  restaurantSlug: string;
};

export function DishCard({ dish, restaurantSlug }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8e8e4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-[#f5f5f0]">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 opacity-40" />
          </div>
        )}
        {dish.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[#1a1a1a]">{dish.name}</h3>
            {dish.description && (
              <p className="mt-1 line-clamp-2 text-sm text-[#888]">
                {dish.description}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-[#fef3e2] px-3 py-1 text-sm font-bold text-orange-600">
            ${dish.price}
          </span>
        </div>

        {dish.model_url && (
          <Link
            href={`/menu/${restaurantSlug}/ar/${dish.slug}`}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white transition-colors hover:bg-orange-500"
          >
            <View className="h-4 w-4" />
            View in AR
          </Link>
        )}
      </div>
    </article>
  );
}
