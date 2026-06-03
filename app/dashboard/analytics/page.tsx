"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, UtensilsCrossed, View, QrCode, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrafficChart, TopDishesChart, DeviceBreakdown } from "@/components/dashboard/analytics-charts";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/lib/types";

type TimeRange = "7d" | "30d" | "90d";

interface StatsData {
  menuViews: number;
  dishViews: number;
  arViews: number;
  qrScans: number;
  prevMenuViews: number;
  prevDishViews: number;
  prevArViews: number;
  prevQrScans: number;
}

interface TrafficPoint {
  date: string;
  menu_view: number;
  dish_view: number;
  ar_view: number;
}

interface DishViewData {
  name: string;
  views: number;
}

function getDateRange(range: TimeRange): { from: Date; to: Date; prevFrom: Date; prevTo: Date } {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const from = new Date(now.getTime() - days * 86400000);
  const prevFrom = new Date(from.getTime() - days * 86400000);
  return { from, to: now, prevFrom, prevTo: from };
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function pctChange(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0 && current === 0) return { value: "0%", positive: true };
  if (previous === 0) return { value: "+100%", positive: true };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: `${pct >= 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

function isMobile(ua: string | null): boolean {
  if (!ua) return false;
  return /mobile|android|iphone|ipad|ipod/i.test(ua);
}

export default function AnalyticsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all");
  const [range, setRange] = useState<TimeRange>("30d");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);
  const [topDishes, setTopDishes] = useState<DishViewData[]>([]);
  const [deviceStats, setDeviceStats] = useState({ mobile: 0, desktop: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch restaurants
  useEffect(() => {
    async function fetchRestaurants() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .order("name");
      setRestaurants(data || []);
    }
    fetchRestaurants();
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { from, to, prevFrom, prevTo } = getDateRange(range);

    // Build query for current period
    let currentQuery = supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    let prevQuery = supabase
      .from("analytics_events")
      .select("event_type")
      .gte("created_at", prevFrom.toISOString())
      .lte("created_at", prevTo.toISOString());

    if (selectedRestaurant !== "all") {
      currentQuery = currentQuery.eq("restaurant_id", selectedRestaurant);
      prevQuery = prevQuery.eq("restaurant_id", selectedRestaurant);
    }

    const [{ data: currentEvents }, { data: prevEvents }] = await Promise.all([
      currentQuery,
      prevQuery,
    ]);

    const events = currentEvents || [];
    const prev = prevEvents || [];

    // Stats
    const count = (arr: Array<{ event_type: string }>, type: string) =>
      arr.filter((e) => e.event_type === type).length;

    setStats({
      menuViews: count(events, "menu_view"),
      dishViews: count(events, "dish_view"),
      arViews: count(events, "ar_view"),
      qrScans: count(events, "qr_scan"),
      prevMenuViews: count(prev, "menu_view"),
      prevDishViews: count(prev, "dish_view"),
      prevArViews: count(prev, "ar_view"),
      prevQrScans: count(prev, "qr_scan"),
    });

    // Traffic data (group by day)
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const trafficMap = new Map<string, TrafficPoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(from.getTime() + i * 86400000);
      const key = formatDate(d);
      trafficMap.set(key, { date: key.slice(5), menu_view: 0, dish_view: 0, ar_view: 0 });
    }
    for (const e of events) {
      const key = formatDate(new Date(e.created_at));
      const point = trafficMap.get(key);
      if (point && (e.event_type === "menu_view" || e.event_type === "dish_view" || e.event_type === "ar_view")) {
        point[e.event_type as "menu_view" | "dish_view" | "ar_view"]++;
      }
    }
    setTrafficData(Array.from(trafficMap.values()));

    // Top dishes
    const dishCounts = new Map<string, number>();
    for (const e of events) {
      if (e.event_type === "dish_view" && e.metadata?.dish_name) {
        const name = String(e.metadata.dish_name);
        dishCounts.set(name, (dishCounts.get(name) || 0) + 1);
      }
    }
    setTopDishes(
      Array.from(dishCounts.entries())
        .map(([name, views]) => ({ name, views }))
        .sort((a, b) => b.views - a.views)
    );

    // Device breakdown
    let mobile = 0;
    let desktop = 0;
    for (const e of events) {
      if (isMobile(e.user_agent)) mobile++;
      else desktop++;
    }
    setDeviceStats({ mobile, desktop });

    setLoading(false);
  }, [range, selectedRestaurant]);

  useEffect(() => {
    (async () => {
      await fetchAnalytics();
    })();
  }, [fetchAnalytics]);

  const statCards = stats
    ? [
        {
          title: "Menu Views",
          value: stats.menuViews,
          icon: <Eye className="h-5 w-5" />,
          change: pctChange(stats.menuViews, stats.prevMenuViews),
        },
        {
          title: "Dish Views",
          value: stats.dishViews,
          icon: <UtensilsCrossed className="h-5 w-5" />,
          change: pctChange(stats.dishViews, stats.prevDishViews),
        },
        {
          title: "AR Activations",
          value: stats.arViews,
          icon: <View className="h-5 w-5" />,
          change: pctChange(stats.arViews, stats.prevArViews),
        },
        {
          title: "QR Scans",
          value: stats.qrScans,
          icon: <QrCode className="h-5 w-5" />,
          change: pctChange(stats.qrScans, stats.prevQrScans),
        },
      ]
    : [];

  return (
    <>
      <DashboardHeader title="Analytics" description="Track menu views, AR interactions, and QR scans" onMenuToggle={() => {}}>
        {/* Restaurant filter */}
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
        >
          <option value="all">All restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </DashboardHeader>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Time range selector */}
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                range === r
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>

        {/* Stats cards */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{card.title}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                    {card.icon}
                  </div>
                </div>
                <p className="mt-2 text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
                <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${card.change.positive ? "text-emerald-400" : "text-red-400"}`}>
                  {card.change.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.change.value} vs prev period
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Traffic chart — spans 2 cols */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Daily Traffic</h3>
            {loading ? <Skeleton variant="card" height={280} /> : <TrafficChart data={trafficData} />}
          </div>

          {/* Device breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Device Breakdown</h3>
            {loading ? <Skeleton variant="card" height={200} /> : <DeviceBreakdown {...deviceStats} />}
          </div>
        </div>

        {/* Top dishes */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Most Viewed Dishes</h3>
          {loading ? <Skeleton variant="card" height={260} /> : <TopDishesChart data={topDishes} />}
        </div>
      </div>
    </>
  );
}
