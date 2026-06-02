import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      {/* 404 text */}
      <div className="relative">
        <h1 className="text-[8rem] font-extrabold leading-none tracking-tighter text-zinc-800 sm:text-[12rem]">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[8rem] font-extrabold leading-none tracking-tighter bg-gradient-to-b from-zinc-400 to-zinc-700 bg-clip-text text-transparent sm:text-[12rem]">
            404
          </h1>
        </div>
      </div>

      <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
        Page not found
      </h2>
      <p className="mt-3 max-w-md text-zinc-500">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
        have been moved or doesn&apos;t exist.
      </p>

      <Link href="/" className="mt-8">
        <Button variant="outline" size="lg" className="group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Go Home
        </Button>
      </Link>
    </div>
  );
}
