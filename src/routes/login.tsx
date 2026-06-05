import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BG_URL = "https://i.postimg.cc/vZrvnWpq/opt3.jpg";
const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log in — Unique" },
      { name: "description", content: "Welcome back. Log in to your Unique maker account." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && session) {
      navigate({ to: "/dashboard" });
    }
  }, [session, authLoading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/70" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="mb-6 flex items-center gap-2.5">
          <img
            src={CHICKEN_URL}
            alt="Space Chicken mascot"
            className="h-12 w-12 object-contain drop-shadow-lg"
          />
          <span className="font-display text-2xl font-semibold text-foreground drop-shadow-sm">
            Unique
          </span>
        </Link>

        <div className="w-full rounded-3xl border border-border/60 bg-card/85 p-7 shadow-glow backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Log in to keep sharing what your hands make.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-background/70"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-background/70 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-gradient-brand text-base font-semibold text-white shadow-soft hover:opacity-95"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            New to Unique?{" "}
            <Link to="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
