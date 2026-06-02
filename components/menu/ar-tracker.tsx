"use client";

import { useTrackARView } from "@/lib/analytics";

type Props = {
  restaurantId: string;
  dishId: string;
  dishName: string;
};

export function ARTracker({ restaurantId, dishId, dishName }: Props) {
  useTrackARView(restaurantId, dishId, dishName);
  return null;
}
