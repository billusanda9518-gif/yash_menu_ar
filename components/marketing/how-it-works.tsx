import { Upload, QrCode, Eye } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Menu",
    description:
      "Add your dishes with photos, descriptions, and prices. Upload 3D models for the AR experience — or let our team create them for you.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate QR Codes",
    description:
      "Get unique, branded QR codes for every table. Print them on table tents, menu cards, or even receipts. One scan opens the full experience.",
  },
  {
    number: "03",
    icon: Eye,
    title: "Customers View in AR",
    description:
      "Diners scan the QR code on their phone, browse your menu, and tap to see a life-sized 3D preview of every dish right on their table.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Three steps to{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              AR menus
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Get your restaurant set up in under 15 minutes. No hardware
            required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-20">
          {/* Connecting line (desktop) */}
          <div className="absolute top-24 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] hidden h-px bg-gradient-to-r from-orange-500/50 via-orange-500/20 to-orange-500/50 lg:block" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <span className="text-xs font-bold tracking-widest text-orange-500/60">
                  STEP {step.number}
                </span>

                {/* Icon circle */}
                <div className="relative mt-4">
                  <div className="absolute -inset-3 rounded-full bg-orange-500/10 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20">
                    <step.icon className="h-7 w-7 text-orange-400" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
