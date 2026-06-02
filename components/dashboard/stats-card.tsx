import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
};

export function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {trend && (
        <p className={`mt-1 text-sm ${trendUp ? "text-green-400" : "text-red-400"}`}>
          {trend}
        </p>
      )}
    </div>
  );
}
