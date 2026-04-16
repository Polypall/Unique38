import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Palette, ShoppingBag, Store } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BG_URL = "https://i.postimg.cc/vZrvnWpq/opt3.jpg";
const LOGO_URL = "https://i.postimg.cc/W3V2QG5t/In-Shot-20251108-192211830.jpg";

type AccountType = "artist" | "buyer" | "seller";

const ACCOUNT_OPTIONS: {
  value: AccountType;
  label: string;
  desc: string;
  icon: typeof Palette;
}[] = [
  {
    value: "artist",
    label: "Artist / Maker",
    desc: "Share what you craft",
    icon: Palette,
  },
  {
    value: "buyer",
    label: "Buyer",
    desc: "Discover & collect art",
    icon: ShoppingBag,
  },
  {
    value: "seller",
    label: "Seller",
    desc: "Vend at events & online",
    icon: Store,
  },
];

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Sign up — Unique" },
      {
        name: "description",
        content:
          "Join Unique — a social home for hand-crafting artists, buyers, and sellers.",
      },
    ],
  }),
});

function SignupPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [accountType, setAccountType] = React.useState<AccountType>("artist");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && session) {
      navigate({ to: "/dashboard" });
    }
  }, [session, authLoading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          display_name: displayName,
          account_type: accountType,
        },
      },
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Welcome to Unique.");
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
            src={LOGO_URL}
            alt="Unique logo"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-pink/50 shadow-soft"
          />
          <span className="font-display text-2xl font-semibold text-foreground drop-shadow-sm">
            Unique
          </span>
        </Link>

        <div className="w-full rounded-3xl border border-border/60 bg-card/85 p-7 shadow-glow backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-semibold">Join Unique</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Made with your hands? You belong here.
            </p>
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
                          ? "border-transparent bg-gradient-brand text-foreground shadow-soft"
                          : "border-border/60 bg-background/60 hover:border-brand-pink/60",
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
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-11 rounded-xl bg-background/70"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-gradient-brand text-base font-semibold text-foreground shadow-soft hover:opacity-95"
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
