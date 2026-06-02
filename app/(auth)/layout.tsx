import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-white transition-colors hover:text-orange-400"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            ARMenu
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
