"use client";

import * as React from "react";
import Link from "next/link";
import { Sprout, Wifi, WifiOff, User, LogOut } from "lucide-react";
import { DyslexiaToggle } from "./dyslexia-toggle";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [isOnline, setIsOnline] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Online / Offline listener
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Supabase auth state
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] transition-transform group-hover:scale-105">
            <Sprout className="h-7 w-7 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                CuteBloom
              </span>
              <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
                ADHD Companion
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:block">
              Gentle medication & focus companion
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline / Online pill */}
          <div
            className={`hidden xs:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
            }`}
            title={isOnline ? "Connected to Supabase" : "Offline mode active (Dexie storage)"}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span className="text-[11px]">Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span className="text-[11px]">Offline</span>
              </>
            )}
          </div>

          <DyslexiaToggle />
          <ThemeToggle />

          {!loading && (
            <div>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-xs text-[hsl(var(--muted-foreground))]">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-1.5 text-xs"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="default" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
