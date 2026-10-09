"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setMessage("A magic sign-in link has been sent to your inbox. Tap it to sign in without passwords!");
    }
  };

  const handleGuestMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cutebloom_guest_mode", "true");
    }
    router.push("/");
  };

  return (
    <main className="min-h-screen py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Welcome to CuteBloom
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            ADHD medication reminder and gentle focus companion.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in or Get Started</CardTitle>
            <CardDescription>
              Passwordless login via email magic link, or start immediately in offline guest mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? (
              <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Check your email</span>
                </div>
                <p className="text-xs leading-relaxed">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-[hsl(var(--foreground))]">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-xs text-[hsl(var(--destructive))] font-medium">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {loading ? "Sending link..." : "Send Magic Link"}
                </Button>
              </form>
            )}

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <span className="relative bg-[hsl(var(--card))] px-3 text-xs text-[hsl(var(--muted-foreground))] uppercase font-medium">
                Or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGuestMode}
              className="w-full gap-2"
            >
              <span>Continue as Guest (Offline Mode)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="pt-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span>Zero health data shared with third parties • UK GDPR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <MedicalDisclaimer compact />
      </div>
    </main>
  );
}
