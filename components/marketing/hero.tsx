import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-left orange gradient orb */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
        {/* Bottom-right blue gradient orb */}
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[150px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-400">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
            Now in public beta
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in mt-8 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl [animation-delay:100ms]">
            See Your Food{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Before Ordering
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl [animation-delay:200ms]">
            Give your diners a magical experience. AR-enabled digital menus let
            customers visualize dishes on their table before they order —
            boosting satisfaction and reducing food waste.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:300ms]">
            <Link href={ROUTES.SIGNUP}>
              <Button size="lg" className="group min-w-[200px]">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="animate-fade-in mt-10 text-sm text-zinc-600 [animation-delay:400ms]">
            Trusted by <span className="text-zinc-400 font-medium">500+</span>{" "}
            restaurants worldwide
          </p>
        </div>

        {/* Hero visual — AR phone mockup */}
        <div className="animate-slide-up relative mx-auto mt-16 max-w-3xl [animation-delay:500ms]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 shadow-2xl shadow-black/50">
            {/* Inner glow border */}
            <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-zinc-800/50 via-transparent to-orange-500/5" />

            {/* Mock dashboard content */}
            <div className="relative flex h-full flex-col p-6 sm:p-8">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <div className="h-5 w-48 rounded-md bg-zinc-800/80" />
                <div className="w-16" />
              </div>

              {/* Content grid */}
              <div className="mt-6 flex flex-1 gap-4">
                {/* Sidebar */}
                <div className="hidden w-32 flex-col gap-3 sm:flex">
                  <div className="h-8 rounded-lg bg-orange-500/20 border border-orange-500/30" />
                  <div className="h-8 rounded-lg bg-zinc-800/60" />
                  <div className="h-8 rounded-lg bg-zinc-800/60" />
                  <div className="h-8 rounded-lg bg-zinc-800/60" />
                </div>

                {/* Main area */}
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl bg-zinc-800/50 p-4 border border-zinc-700/50">
                      <div className="h-3 w-20 rounded bg-zinc-700" />
                      <div className="mt-2 h-6 w-16 rounded bg-orange-500/30" />
                    </div>
                    <div className="flex-1 rounded-xl bg-zinc-800/50 p-4 border border-zinc-700/50">
                      <div className="h-3 w-20 rounded bg-zinc-700" />
                      <div className="mt-2 h-6 w-16 rounded bg-emerald-500/30" />
                    </div>
                    <div className="hidden flex-1 rounded-xl bg-zinc-800/50 p-4 border border-zinc-700/50 sm:block">
                      <div className="h-3 w-20 rounded bg-zinc-700" />
                      <div className="mt-2 h-6 w-16 rounded bg-sky-500/30" />
                    </div>
                  </div>
                  {/* Chart area */}
                  <div className="flex-1 rounded-xl bg-zinc-800/40 p-4 border border-zinc-700/50">
                    <div className="flex h-full items-end gap-1.5">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-orange-500/60 to-orange-500/20"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection glow */}
          <div className="absolute -bottom-8 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
