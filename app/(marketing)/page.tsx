import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { CTA } from "@/components/marketing/cta";

export const metadata: Metadata = {
  title: "ARMenu — See Your Food Before Ordering",
  description:
    "Transform your restaurant with AR-enabled digital menus. Customers scan QR codes, browse your menu, and see 3D previews of dishes on their table before ordering.",
  openGraph: {
    title: "ARMenu — See Your Food Before Ordering",
    description:
      "AR-enabled digital menus for restaurants. Let your customers see their food before ordering.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <PricingCards />
      <CTA />
    </>
  );
}
