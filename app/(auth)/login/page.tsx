import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ARMenu dashboard to manage your restaurant menus.",
};

function LoginSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm animate-pulse">
      <div className="mb-6 text-center">
        <div className="mx-auto h-7 w-40 rounded bg-zinc-700" />
        <div className="mx-auto mt-3 h-4 w-56 rounded bg-zinc-800" />
      </div>
      {/* Google button skeleton */}
      <div className="h-10 w-full rounded-md bg-zinc-800 border border-zinc-700" />
      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>
      {/* Email field skeleton */}
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 h-4 w-12 rounded bg-zinc-700" />
          <div className="h-10 w-full rounded-md bg-zinc-800 border border-zinc-700" />
        </div>
        {/* Password field skeleton */}
        <div>
          <div className="mb-1.5 h-4 w-16 rounded bg-zinc-700" />
          <div className="h-10 w-full rounded-md bg-zinc-800 border border-zinc-700" />
        </div>
        <div className="flex justify-end">
          <div className="h-4 w-28 rounded bg-zinc-800" />
        </div>
        <div className="h-10 w-full rounded-md bg-orange-500/30" />
      </div>
      <div className="mt-6 flex justify-center">
        <div className="h-4 w-48 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
