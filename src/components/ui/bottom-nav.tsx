"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Pill, Bell, Package, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/medications", icon: Pill, label: "Meds" },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/refills", icon: Package, label: "Refills" },
  { href: "/checkin", icon: CheckCircle2, label: "Check-in" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur-md pb-safe md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around px-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-2xl py-2 px-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5 transition-transform", isActive && "scale-110")}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
