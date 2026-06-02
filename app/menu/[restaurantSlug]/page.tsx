import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryNav } from "@/components/menu/category-nav";
import { DishCard } from "@/components/menu/dish-card";
import type { Restaurant, MenuCategory, Dish } from "@/lib/types";

type Props = { params: Promise<{ restaurantSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("name, description")
    .eq("slug", restaurantSlug)
    .eq("is_active", true)
    .single();

  if (!data) return { title: "Menu Not Found" };
  return {
    title: `${data.name} — Menu`,
    description: data.description || `Browse the menu at ${data.name}`,
  };
}

export default async function CustomerMenuPage({ params }: Props) {
  const { restaurantSlug } = await params;
  const supabase = await createClient();

  // Fetch restaurant
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", restaurantSlug)
    .eq("is_active", true)
    .single();

  if (!restaurant) notFound();

  // Fetch categories and dishes
  const [categoriesRes, dishesRes] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("dishes")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_available", true)
      .order("sort_order"),
  ]);

  const categories: MenuCategory[] = categoriesRes.data || [];
  const dishes: Dish[] = dishesRes.data || [];

  // Group dishes by category
  const dishesByCategory = new Map<string, Dish[]>();
  const uncategorized: Dish[] = [];

  for (const dish of dishes) {
    if (dish.category_id) {
      const existing = dishesByCategory.get(dish.category_id) || [];
      existing.push(dish);
      dishesByCategory.set(dish.category_id, existing);
    } else {
      uncategorized.push(dish);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-12">
      {/* Restaurant header */}
      <header className="pb-6 pt-8 text-center">
        {restaurant.logo_url && (
          <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl shadow-md">
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
          {restaurant.name}
        </h1>
        {restaurant.description && (
          <p className="mt-2 text-[#666]">{restaurant.description}</p>
        )}
      </header>

      {/* Category navigation */}
      {categories.length > 0 && (
        <CategoryNav categories={categories} />
      )}

      {/* Menu sections */}
      <div className="mt-6 space-y-10">
        {categories.map((category) => {
          const categoryDishes = dishesByCategory.get(category.id) || [];
          if (categoryDishes.length === 0) return null;

          return (
            <section key={category.id} id={`cat-${category.slug}`}>
              <h2 className="mb-4 text-xl font-bold text-[#1a1a1a]">
                {category.name}
              </h2>
              {category.description && (
                <p className="mb-4 text-sm text-[#888]">{category.description}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {categoryDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    restaurantSlug={restaurantSlug}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {uncategorized.length > 0 && (
          <section id="cat-other">
            <h2 className="mb-4 text-xl font-bold text-[#1a1a1a]">Other</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {uncategorized.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  restaurantSlug={restaurantSlug}
                />
              ))}
            </div>
          </section>
        )}

        {dishes.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-[#999]">No dishes available right now.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#e5e5e5] pt-6 text-center">
        <Link
          href="/"
          className="text-xs text-[#999] transition-colors hover:text-orange-500"
        >
          Powered by <span className="font-semibold">ARMenu</span>
        </Link>
      </footer>
    </main>
  );
}
