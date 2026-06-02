"use client";

import { useTrackPageView, useTrackQRScan } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";

type Props = {
  restaurantId: string;
};

export function MenuTracker({ restaurantId }: Props) {
  const searchParams = useSearchParams();
  const table = searchParams.get("table");

  useTrackPageView(restaurantId);
  useTrackQRScan(restaurantId, table);

  return null; // Invisible tracking component
}
