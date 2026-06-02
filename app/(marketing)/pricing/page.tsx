import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing — ARMenu",
  description:
    "Transparent pricing for every restaurant. Start free, upgrade when you're ready. No hidden fees, cancel anytime.",
  openGraph: {
    title: "Pricing — ARMenu",
    description:
      "Simple, transparent pricing for AR-enabled digital menus. Start free with 1 restaurant and 10 dishes.",
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  Feature comparison data                                           */
/* ------------------------------------------------------------------ */

type FeatureValue = string | boolean;

interface ComparisonRow {
  feature: string;
  free: FeatureValue;
  pro: FeatureValue;
  enterprise: FeatureValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Restaurants", free: "1", pro: "3", enterprise: "Unlimited" },
  {
    feature: "Dishes per restaurant",
    free: "10",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  { feature: "Branches", free: "1", pro: "5", enterprise: "Unlimited" },
  { feature: "Team members", free: "2", pro: "10", enterprise: "Unlimited" },
  { feature: "QR code generation", free: true, pro: true, enterprise: true },
  { feature: "AR 3D models", free: true, pro: true, enterprise: true },
  {
    feature: "Analytics dashboard",
    free: true,
    pro: true,
    enterprise: true,
  },
  { feature: "Custom domain", free: false, pro: false, enterprise: true },
  { feature: "Priority support", free: false, pro: false, enterprise: true },
  { feature: "API access", free: false, pro: false, enterprise: true },
];

/* ------------------------------------------------------------------ */
/*  FAQ data                                                          */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) processed securely via Stripe.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "The Free plan is always free — no credit card required. Pro and Enterprise plans come with a 14-day free trial so you can explore every feature before committing.",
  },
  {
    question: "What happens if I cancel?",
    answer:
      "You keep full access to your plan's features until the end of your current billing period. After that, your account reverts to the Free plan.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a full refund within 14 days of your first payment — no questions asked.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: render a cell value                                       */
/* ------------------------------------------------------------------ */

function CellValue({ value }: { value: FeatureValue }) {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    );
  }

  if (value) {
    return (
      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15">
        <Check className="h-3.5 w-3.5 text-orange-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800/60">
      <X className="h-3.5 w-3.5 text-zinc-600" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            Pricing
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Choose the right{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              plan
            </span>{" "}
            for your restaurant
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Start free, upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────────────── */}
      <PricingCards />

      {/* ── Gradient divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      {/* ── Feature Comparison Table ──────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Compare{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                features
              </span>
            </h2>
            <p className="mt-4 text-zinc-400">
              A detailed breakdown of what&apos;s included in each plan.
            </p>
          </div>

          {/* Table wrapper — horizontally scrollable on mobile */}
          <div className="mt-14 overflow-x-auto rounded-2xl border border-zinc-800/60">
            <table className="w-full min-w-[540px] text-left">
              {/* Header */}
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="px-6 py-4 text-sm font-medium text-zinc-400">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-200">
                    Free
                  </th>
                  <th className="relative px-6 py-4 text-center text-sm font-semibold text-orange-400">
                    Pro
                    {/* Highlight column header */}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500" />
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-200">
                    Enterprise
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={
                      idx % 2 === 0
                        ? "bg-zinc-900"
                        : "bg-zinc-900/50"
                    }
                  >
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={row.free} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={row.pro} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Gradient divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      {/* ── FAQ Section ───────────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently asked{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
            <p className="mt-4 text-zinc-400">
              Everything you need to know about billing and plans.
            </p>
          </div>

          <div className="mt-14 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 transition-colors open:bg-zinc-900/70"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-6 py-5 text-sm font-medium text-zinc-100 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  {/* Chevron rotates when open */}
                  <svg
                    className="h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-zinc-400">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gradient divider ──────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      {/* ── CTA Section ───────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 h-[320px] w-[600px] -translate-x-1/2 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              get started
            </span>
            ?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Join thousands of restaurants already using ARMenu to delight their
            customers with immersive 3D dish previews.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={ROUTES.SIGNUP}>
              <Button className="gap-2 px-8 py-3 text-base">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button variant="outline" className="px-8 py-3 text-base">
                View Plans
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-zinc-600">
            No credit card required &middot; Free plan available forever
          </p>
        </div>
      </section>
    </div>
  );
}
