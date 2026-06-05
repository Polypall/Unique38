import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/SiteNav";

const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";

export const Route = createFileRoute("/waitlist")({
  component: WaitlistPage,
  head: () => ({
    meta: [
      { title: "Join the Waitlist — Unique" },
      { name: "description", content: "Be first to join Unique — the platform built for makers, inventors, and hands-on creators." },
    ],
  }),
});

function WaitlistPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("waitlist").insert({ email, name: name || null });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already on the waitlist!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: story */}
          <div>
            <div className="flex items-end gap-4 mb-8">
              <img src={CHICKEN_URL} alt="Space Chicken mascot" className="h-28 w-28 object-contain drop-shadow-xl" />
              <div className="mb-2 rounded-2xl rounded-bl-sm bg-card border border-border/60 px-4 py-2 text-sm font-medium shadow-soft">
                "No maker left behind!" 🚀
              </div>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              A home for every{" "}
              <span className="text-gradient-brand">maker</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Unique is a platform where makers can collaborate, work together, and showcase their creations — centered around STEM while welcoming all handcrafted arts.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Painting, drawing, sewing, crochet, jewelry, puppets, dolls, robotics, cosplay props, books, woodwork, and more. If you create it with your hands, you belong here.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Unique is especially for creators who may not have formal STEM backgrounds and who aren't solely focused on AI startups — those often overlooked for venture funding as they begin their entrepreneurial journeys.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["🎨 Painting", "🧵 Sewing", "🤖 Robotics", "💍 Jewelry", "🪆 Puppets", "📚 Books", "🪵 Woodwork", "✂️ Cosplay"].map((tag) => (
                <span key={tag} className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/80">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-glow">
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="font-display text-2xl font-semibold">You're on the list!</h2>
                <p className="mt-3 text-muted-foreground">
                  We'll reach out as soon as Unique opens up. Thank you for believing in the maker community.
                </p>
                <Button asChild className="mt-6 rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-95">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-semibold">Join the waitlist</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Be among the first makers welcomed into Unique.
                </p>
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">Your name (optional)</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Maker"
                      className="mt-1.5 h-11 rounded-xl bg-background/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 h-11 rounded-xl bg-background/70"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl bg-gradient-brand text-base font-semibold text-white shadow-soft hover:opacity-95"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reserve my spot 🎉"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="underline underline-offset-4 hover:text-foreground">Log in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
