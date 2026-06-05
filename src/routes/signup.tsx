import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Palette, ShoppingBag, Store, Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BG_URL = "https://i.postimg.cc/J4kbZbfm/bg.png";
const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";

type AccountType = "artist" | "buyer" | "seller";

const ACCOUNT_OPTIONS: {
  value: AccountType;
  label: string;
  desc: string;
  icon: typeof Palette;
}[] = [
  { value: "artist", label: "Artist / Maker", desc: "Share what I craft", icon: Palette },
  { value: "buyer", label: "Buyer", desc: "Discover & collect art", icon: ShoppingBag },
  { value: "seller", label: "Seller", desc: "Vend at events & online", icon: Store },
];

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Sign up — Unique" },
      { name: "description", content: "Join Unique — a social home for hand-crafting artists, buyers, and sellers." },
    ],
  }),
});

function SignupPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [accountType, setAccountType] = React.useState<AccountType>("artist");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && session) navigate({ to: "/dashboard" });
  }, [session, authLoading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms and Conditions to continue.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: displayName, account_type: accountType },
      },
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
        account_type: accountType,
        coin_count: 0,
      });
    }
    setSubmitting(false);
    navigate({ to: "/confirm-email" });
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/80" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="mb-6 flex items-center gap-2.5">
          <img src={CHICKEN_URL} alt="Unique mascot" className="h-12 w-12 object-contain drop-shadow-lg" />
          <span className="font-display text-2xl font-semibold text-foreground drop-shadow-sm">Unique</span>
        </Link>

        <div className="w-full rounded-3xl border border-border/60 bg-card/85 p-7 shadow-glow backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-semibold">Join Unique</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Every maker has a place here.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>I'm joining as a…</Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_OPTIONS.map(({ value, label, desc, icon: Icon }) => {
                  const active = accountType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAccountType(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all",
                        active
                          ? "border-transparent bg-gradient-brand text-white shadow-soft"
                          : "border-border/60 bg-background/60 hover:border-brand-purple/60",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                      <span className="text-[10px] leading-tight opacity-80">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your maker name"
                className="h-11 rounded-xl bg-background/70"
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-brand-purple"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" target="_blank" className="text-foreground underline underline-offset-4 hover:opacity-80">
                  Terms and Conditions
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-gradient-brand text-base font-semibold text-white shadow-soft hover:opacity-95"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already a maker here?{" "}
            <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
