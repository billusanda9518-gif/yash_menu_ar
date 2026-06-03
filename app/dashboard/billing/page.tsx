"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Crown,
  ExternalLink,
  Infinity as InfinityIcon,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
  Zap,
  AlertTriangle,
  Check,
  BarChart3,
  Globe,
  Headphones,
  Users,
  GitBranch,
  Box,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UsageCounts {
  restaurants: number;
  dishes: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trialing", variant: "success" },
  past_due: { label: "Past Due", variant: "warning" },
  canceled: { label: "Canceled", variant: "destructive" },
  paused: { label: "Paused", variant: "secondary" },
};

const PLAN_DISPLAY: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; gradient: string }
> = {
  free: {
    label: "Free",
    icon: <Star className="h-5 w-5" />,
    color: "text-zinc-300",
    gradient: "from-zinc-500 to-zinc-600",
  },
  pro: {
    label: "Pro",
    icon: <Rocket className="h-5 w-5" />,
    color: "text-orange-400",
    gradient: "from-orange-500 to-amber-500",
  },
  enterprise: {
    label: "Enterprise",
    icon: <Crown className="h-5 w-5" />,
    color: "text-violet-400",
    gradient: "from-violet-500 to-purple-600",
  },
};

const PRO_FEATURES = [
  { icon: <Store className="h-4 w-4" />, text: "Up to 3 restaurants" },
  { icon: <UtensilsCrossed className="h-4 w-4" />, text: "Unlimited dishes" },
  { icon: <GitBranch className="h-4 w-4" />, text: "Up to 5 branches" },
  { icon: <Users className="h-4 w-4" />, text: "Up to 10 staff members" },
  { icon: <Box className="h-4 w-4" />, text: "AR 3D models" },
  { icon: <BarChart3 className="h-4 w-4" />, text: "Advanced analytics" },
];

const ENTERPRISE_FEATURES = [
  { icon: <Store className="h-4 w-4" />, text: "Unlimited restaurants" },
  { icon: <UtensilsCrossed className="h-4 w-4" />, text: "Unlimited dishes" },
  { icon: <GitBranch className="h-4 w-4" />, text: "Unlimited branches" },
  { icon: <Users className="h-4 w-4" />, text: "Unlimited staff members" },
  { icon: <Box className="h-4 w-4" />, text: "AR 3D models" },
  { icon: <BarChart3 className="h-4 w-4" />, text: "Advanced analytics" },
  { icon: <Globe className="h-4 w-4" />, text: "Custom domain" },
  { icon: <Headphones className="h-4 w-4" />, text: "Priority support" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatLimit(value: number): string {
  return value === Infinity ? "Unlimited" : String(value);
}

function usagePercent(current: number, max: number): number {
  if (max === Infinity) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function UsageMeter({
  label,
  icon,
  current,
  max,
}: {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number;
}) {
  const pct = usagePercent(current, max);
  const isUnlimited = max === Infinity;
  const isNearLimit = !isUnlimited && pct >= 80;
  const isAtLimit = !isUnlimited && pct >= 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          {icon}
          {label}
        </div>
        <span className="text-sm tabular-nums text-zinc-400">
          {current} / {isUnlimited ? <InfinityIcon className="inline h-3.5 w-3.5" /> : max}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isAtLimit
              ? "bg-gradient-to-r from-red-500 to-red-400"
              : isNearLimit
                ? "bg-gradient-to-r from-amber-500 to-orange-400"
                : "bg-gradient-to-r from-orange-500 to-amber-400"
          }`}
          style={{ width: isUnlimited ? "5%" : `${Math.max(pct, 2)}%` }}
        />
      </div>
      {isUnlimited && (
        <p className="text-xs text-emerald-400">
          <Sparkles className="mr-1 inline h-3 w-3" />
          Unlimited on your plan
        </p>
      )}
      {isAtLimit && (
        <p className="text-xs text-red-400">
          <AlertTriangle className="mr-1 inline h-3 w-3" />
          Limit reached — upgrade to add more
        </p>
      )}
    </div>
  );
}

function PlanUpgradeCard({
  planKey,
  price,
  features,
  onUpgrade,
  loading,
}: {
  planKey: "pro" | "enterprise";
  price: string;
  features: { icon: React.ReactNode; text: string }[];
  onUpgrade: () => void;
  loading: boolean;
}) {
  const display = PLAN_DISPLAY[planKey];
  const isEnterprise = planKey === "enterprise";

  return (
    <div className="group relative">
      {/* Gradient border glow */}
      <div
        className={`absolute -inset-[1px] rounded-xl bg-gradient-to-br ${display.gradient} opacity-20 blur-sm transition-opacity duration-500 group-hover:opacity-40`}
      />
      <div
        className={`absolute -inset-[1px] rounded-xl bg-gradient-to-br ${display.gradient} opacity-30 transition-opacity duration-500 group-hover:opacity-50`}
      />
      <Card
        glass
        className="relative flex h-full flex-col border-0 bg-zinc-900/80 backdrop-blur-xl"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${display.gradient} text-white shadow-lg`}
              >
                {display.icon}
              </div>
              <CardTitle className="text-xl text-white">{display.label}</CardTitle>
            </div>
            {isEnterprise && (
              <Badge variant="warning" className="text-[10px]">
                Best Value
              </Badge>
            )}
          </div>
          <CardDescription className="mt-2">
            <span className="text-3xl font-bold text-white">{price}</span>
            <span className="text-zinc-400"> / month</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-zinc-300">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${display.gradient} text-white`}
                >
                  <Check className="h-3 w-3" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            className={`w-full bg-gradient-to-r ${display.gradient} border-0 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110`}
            size="lg"
            loading={loading}
            onClick={onUpgrade}
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade to {display.label}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function BillingSkeleton() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Current plan skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton variant="text" width={120} height={28} />
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="text" width={100} height={24} />
        </div>
        <Skeleton variant="text" width={200} height={16} className="mt-4" />
      </div>

      {/* Usage meters skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <Skeleton variant="text" width={150} height={16} />
            <Skeleton variant="text" className="mt-4" height={10} />
          </div>
        ))}
      </div>

      {/* Plan cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="card" height={400} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    subscription,
    plan,
    limits,
    loading: subLoading,
    isFreePlan,
    isProPlan,
    isEnterprisePlan,
  } = useSubscription();

  const [usage, setUsage] = useState<UsageCounts>({ restaurants: 0, dishes: 0 });
  const [usageLoading, setUsageLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "enterprise" | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  /* ---- Toast on redirect ---- */
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      showToast.success("Subscription activated!", "Your plan has been upgraded successfully.");
    }
    if (canceled === "true") {
      showToast.info("Checkout was canceled", "You can upgrade anytime from this page.");
    }
  }, [searchParams]);

  /* ---- Fetch usage counts ---- */
  const fetchUsage = useCallback(async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Get restaurant count (filtered by owner_id)
      const { count: restaurantCount } = await supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      // Get all restaurant IDs for the user to query dishes
      const { data: userRestaurants } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id);

      let dishCount = 0;
      if (userRestaurants && userRestaurants.length > 0) {
        const restaurantIds = userRestaurants.map((r) => r.id);
        const { count } = await supabase
          .from("dishes")
          .select("id", { count: "exact", head: true })
          .in("restaurant_id", restaurantIds);
        dishCount = count || 0;
      }

      setUsage({
        restaurants: restaurantCount || 0,
        dishes: dishCount,
      });
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    } finally {
      setUsageLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      (async () => {
        await fetchUsage();
      })();
    }
  }, [user, fetchUsage]);

  /* ---- Checkout handler ---- */
  async function handleUpgrade(targetPlan: "pro" | "enterprise") {
    setCheckoutLoading(targetPlan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create checkout session");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      showToast.error(
        "Checkout failed",
        err instanceof Error ? err.message : "Please try again later.",
      );
      setCheckoutLoading(null);
    }
  }

  /* ---- Billing portal handler ---- */
  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to open billing portal");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      showToast.error(
        "Portal error",
        err instanceof Error ? err.message : "Please try again later.",
      );
      setPortalLoading(false);
    }
  }

  /* ---- Derived state ---- */
  const isLoading = subLoading || usageLoading;
  const planDisplay = PLAN_DISPLAY[plan] || PLAN_DISPLAY.free;
  const statusConfig =
    subscription?.status && STATUS_CONFIG[subscription.status]
      ? STATUS_CONFIG[subscription.status]
      : null;

  const showUpgrade = isFreePlan || isProPlan;
  const showManage = isProPlan || isEnterprisePlan;
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? false;

  return (
    <>
      <DashboardHeader
        title="Billing"
        description="Manage your subscription and billing"
        onMenuToggle={() => {}}
      />

      {isLoading ? (
        <BillingSkeleton />
      ) : (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          {/* ── Cancellation warning ── */}
          {cancelAtPeriodEnd && subscription && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="font-medium text-amber-300">Subscription ending soon</p>
                <p className="mt-1 text-sm text-amber-400/80">
                  Your subscription will be canceled at the end of this billing period on{" "}
                  <span className="font-semibold text-amber-300">
                    {formatDate(subscription.current_period_end)}
                  </span>
                  . You can reactivate from the billing portal.
                </p>
              </div>
            </div>
          )}

          {/* ── Current Plan ── */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            {/* Background decoration */}
            <div
              className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${planDisplay.gradient} opacity-5 blur-3xl`}
            />

            <div className="relative">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Current Plan
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Plan badge */}
                <div
                  className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${planDisplay.gradient} px-4 py-2 text-lg font-bold text-white shadow-lg`}
                >
                  {planDisplay.icon}
                  {planDisplay.label}
                </div>

                {/* Status badge */}
                {statusConfig && (
                  <Badge variant={statusConfig.variant} className="text-xs">
                    {statusConfig.label}
                  </Badge>
                )}
              </div>

              {/* Period info */}
              {subscription && subscription.plan !== "free" && (
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
                  <span>
                    Billing period:{" "}
                    <span className="text-zinc-300">
                      {formatDate(subscription.current_period_start)}
                    </span>
                    {" — "}
                    <span className="text-zinc-300">
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </span>
                </div>
              )}

              {isFreePlan && (
                <p className="mt-4 text-sm text-zinc-400">
                  You&apos;re on the free plan. Upgrade to unlock more features and capacity.
                </p>
              )}
            </div>
          </div>

          {/* ── Usage Meters ── */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Usage</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <UsageMeter
                  label="Restaurants"
                  icon={<Store className="h-4 w-4 text-orange-400" />}
                  current={usage.restaurants}
                  max={limits.max_restaurants}
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <UsageMeter
                  label="Dishes"
                  icon={<UtensilsCrossed className="h-4 w-4 text-orange-400" />}
                  current={usage.dishes}
                  max={limits.max_dishes}
                />
              </div>
            </div>
          </div>

          {/* ── Upgrade Section ── */}
          {showUpgrade && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-white">Upgrade Your Plan</h2>
              <p className="mb-6 text-sm text-zinc-400">
                Unlock more capacity and premium features for your business.
              </p>

              <div
                className={`grid gap-6 ${isFreePlan ? "md:grid-cols-2" : "mx-auto max-w-lg md:grid-cols-1"}`}
              >
                {isFreePlan && (
                  <PlanUpgradeCard
                    planKey="pro"
                    price="$29"
                    features={PRO_FEATURES}
                    onUpgrade={() => handleUpgrade("pro")}
                    loading={checkoutLoading === "pro"}
                  />
                )}
                <PlanUpgradeCard
                  planKey="enterprise"
                  price="$99"
                  features={ENTERPRISE_FEATURES}
                  onUpgrade={() => handleUpgrade("enterprise")}
                  loading={checkoutLoading === "enterprise"}
                />
              </div>
            </div>
          )}

          {/* ── Manage Subscription ── */}
          {showManage && (
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-5 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                    <CreditCard className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Manage Subscription</h2>
                    <p className="text-sm text-zinc-400">
                      Update payment method, view invoices, or cancel your subscription.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    loading={portalLoading}
                    onClick={handleManageSubscription}
                    className="border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Open Billing Portal
                    <ExternalLink className="ml-2 h-3.5 w-3.5 text-zinc-500" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Update payment method
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> View invoices
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Cancel subscription
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Enterprise CTA for Enterprise users ── */}
          {isEnterprisePlan && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 text-center">
              <Crown className="mx-auto h-8 w-8 text-violet-400" />
              <p className="mt-3 text-sm font-medium text-violet-300">
                You&apos;re on our top-tier plan
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Enjoy unlimited access to all features. Need something custom?{" "}
                <a href="mailto:support@armenu.app" className="text-violet-400 hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
