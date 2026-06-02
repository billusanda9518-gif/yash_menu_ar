"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Monitor, Smartphone } from "lucide-react";

// ─── Traffic Line Chart ──────────────────────────────────────────────────────

type TrafficDataPoint = {
  date: string;
  menu_view: number;
  dish_view: number;
  ar_view: number;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-zinc-400">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrafficChart({ data }: { data: TrafficDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        No traffic data yet
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="menu_view"
            name="Menu Views"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f97316" }}
          />
          <Line
            type="monotone"
            dataKey="dish_view"
            name="Dish Views"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#fbbf24" }}
          />
          <Line
            type="monotone"
            dataKey="ar_view"
            name="AR Views"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#34d399" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Top Dishes Bar Chart ────────────────────────────────────────────────────

type DishDataPoint = {
  name: string;
  views: number;
};

const BAR_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#fbbf24"];

export function TopDishesChart({ data }: { data: DishDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
        No dish view data yet
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.slice(0, 8).map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Device Breakdown ────────────────────────────────────────────────────────

export function DeviceBreakdown({ mobile, desktop }: { mobile: number; desktop: number }) {
  const total = mobile + desktop;
  const mobilePercent = total > 0 ? Math.round((mobile / total) * 100) : 0;
  const desktopPercent = total > 0 ? 100 - mobilePercent : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
          style={{ width: `${mobilePercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Smartphone className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{mobilePercent}%</p>
            <p className="text-xs text-zinc-500">Mobile ({mobile})</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <Monitor className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{desktopPercent}%</p>
            <p className="text-xs text-zinc-500">Desktop ({desktop})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
