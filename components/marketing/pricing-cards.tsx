import { Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for trying out ARMenu",
    price: 0,
    popular: false,
    cta: "Get Started",
    features: [
      { label: "1 restaurant", included: true },
      { label: "Up to 10 dishes", included: true },
      { label: "QR code generation", included: true },
      { label: "Basic menu page", included: true },
      { label: "AR 3D models", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Custom domain", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For growing restaurants",
    price: 29,
    popular: true,
    cta: "Start Free Trial",
    features: [
      { label: "Up to 3 restaurants", included: true },
      { label: "Unlimited dishes", included: true },
      { label: "QR code generation", included: true },
      { label: "Branded menu page", included: true },
      { label: "AR 3D models", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Custom domain", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Enterprise",
    description: "For restaurant chains",
    price: 99,
    popular: false,
    cta: "Contact Sales",
    features: [
      { label: "Unlimited restaurants", included: true },
      { label: "Unlimited dishes", included: true },
      { label: "QR code generation", included: true },
      { label: "White-label menu page", included: true },
      { label: "AR 3D models", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Custom domain", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

export function PricingCards() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Simple,{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              transparent
            </span>{" "}
            pricing
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Start free, upgrade when you&apos;re ready. No hidden fees, no
            surprises.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-orange-500/50 bg-zinc-900/80 shadow-xl shadow-orange-500/10 scale-[1.02] lg:scale-105"
                  : "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1">Most Popular</Badge>
                </div>
              )}

              {/* Plan info */}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  ${plan.price}
                </span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>

              {/* CTA */}
              <Link href={ROUTES.SIGNUP} className="mt-8 block">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Features */}
              <ul className="mt-8 flex-1 space-y-3 border-t border-zinc-800/60 pt-8">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                        <Check className="h-3 w-3 text-orange-400" />
                      </div>
                    ) : (
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800/60">
                        <X className="h-3 w-3 text-zinc-600" />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
