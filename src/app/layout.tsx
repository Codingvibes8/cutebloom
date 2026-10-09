import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { PwaRegister } from "@/components/pwa-register";
import { OfflineSyncEngine } from "@/components/offline-sync-engine";
import { BottomNav } from "@/components/ui/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuteBloom — ADHD Medication-Reminder & Focus Companion",
  description:
    "Gentle, shame-free ADHD medication reminder, refill tracker and focus companion for UK adults.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CuteBloom",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#376B46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-[hsl(var(--primary))]/20 selection:text-[hsl(var(--primary))]">
        <PwaRegister />
        <OfflineSyncEngine />
        <Navbar />
        <div className="flex-1 flex flex-col pb-16 md:pb-0">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
