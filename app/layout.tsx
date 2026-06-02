import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ARMenu — See Your Food Before Ordering",
    template: "%s | ARMenu",
  },
  description:
    "Transform your restaurant with AR-enabled digital menus. Customers scan QR codes, browse your menu, and preview dishes in augmented reality.",
  metadataBase: new URL("https://armenu.app"),
  openGraph: {
    title: "ARMenu — See Your Food Before Ordering",
    description:
      "AR-enabled digital menus for restaurants. Let your customers see their food before ordering.",
    type: "website",
    siteName: "ARMenu",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARMenu — See Your Food Before Ordering",
    description:
      "AR-enabled digital menus for restaurants. Let your customers see their food before ordering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#fafafa]">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
