import {
  Smartphone,
  QrCode,
  LayoutDashboard,
  BarChart3,
  Building2,
  MonitorSmartphone,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "AR Food Preview",
    description:
      "Customers point their phone at the table and see a life-sized 3D model of every dish. No app download needed — it works in the browser.",
  },
  {
    icon: QrCode,
    title: "QR Code System",
    description:
      "Generate unique, branded QR codes for every table. Customizable designs that match your restaurant's identity and aesthetic.",
  },
  {
    icon: LayoutDashboard,
    title: "Easy Dashboard",
    description:
      "Manage menus, upload 3D models, track orders, and update pricing — all from a simple, intuitive management dashboard.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "See which dishes get the most views, track scan rates, and understand customer preferences with actionable insights.",
  },
  {
    icon: Building2,
    title: "Multi-branch Support",
    description:
      "Manage multiple restaurant locations from one account. Shared menus, independent analytics, and branch-level controls.",
  },
  {
    icon: MonitorSmartphone,
    title: "Mobile Optimized",
    description:
      "Every menu looks beautiful on any device. Fast loading, responsive design, and native-app-like experience on mobile.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              go digital
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Powerful tools to create, manage, and analyze your AR-enabled
            restaurant menus.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 transition-all duration-300 hover:border-orange-500/30 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-orange-500/5"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 transition-colors duration-300 group-hover:border-orange-500/30 group-hover:bg-orange-500/10">
                  <feature.icon className="h-6 w-6 text-zinc-400 transition-colors duration-300 group-hover:text-orange-400" />
                </div>

                {/* Content */}
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
