import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Video, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";

const COIN_URL = "https://i.postimg.cc/SNn7MHf5/8bea2bf5-3ece-47ae-815f-60d31587a068-removebg-preview.png";

export const Route = createFileRoute("/upgrade")({
  component: UpgradePage,
  head: () => ({ meta: [{ title: "Upgrade — Unique" }] }),
});

function UpgradePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-glow text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand shadow-soft">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold">Go Premium</h1>
          <p className="mt-2 text-muted-foreground">Unlock the full Unique experience.</p>

          <div className="mt-8 space-y-3 text-left">
            {[
              { icon: Video, text: "Upload 30-second video clips of your creations" },
              { icon: Pencil, text: "Change your display name anytime" },
              { icon: Crown, text: "Premium badge on your profile" },
              { icon: Check, text: "Support the maker community" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-5">
            <p className="font-display text-4xl font-semibold">$5<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <p className="mt-1 text-sm text-muted-foreground">Cancel anytime</p>
          </div>

          {/* Stripe checkout will go here — for now show coming soon */}
          <Button
            className="mt-6 h-12 w-full rounded-xl bg-gradient-brand text-base font-semibold text-white shadow-soft hover:opacity-95"
            onClick={() => alert("Payment coming soon! Check back shortly.")}
          >
            <Crown className="mr-2 h-5 w-5" /> Upgrade Now
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <img src={COIN_URL} alt="coin" className="h-4 w-4 object-contain" />
            Premium members still earn Art Galaxy Coins every day
          </div>

          <Link to="/dashboard" className="mt-4 block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Maybe later
          </Link>
        </div>
      </main>
    </div>
  );
}
