"use client";

import { useState } from "react";
import type { MenuCategory } from "@/lib/types";

type Props = {
  categories: MenuCategory[];
};

export function CategoryNav({ categories }: Props) {
  const [active, setActive] = useState<string | null>(null);

  function handleClick(slug: string) {
    setActive(slug);
    const el = document.getElementById(`cat-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="sticky top-0 z-10 -mx-4 overflow-x-auto border-b border-[#e5e5e5] bg-[#fafaf8]/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat.slug
                ? "bg-orange-500 text-white"
                : "bg-[#f0f0ec] text-[#555] hover:bg-[#e5e5e0]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
