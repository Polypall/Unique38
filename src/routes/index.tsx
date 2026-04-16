import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";
import { Palette, Users, CalendarHeart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const benefits = [
  {
    icon: Palette,
    title: "Show what your hands made",
    body: "A gallery built for paintings, sculptures, crochet, cosplay props, woodwork — anything you craft by hand.",
  },
  {
    icon: Users,
    title: "Find your people",
    body: "Connect with makers in your area and inside groups for sculpture, clay, puppets, robots, clothes and more.",
  },
  {
    icon: CalendarHeart,
    title: "Sell & vend locally",
    body: "Post upcoming art events, vending opportunities, and let buyers discover the maker behind the work.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Soft brand blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-pink/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
              The site for makers
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              A home for art made by{" "}
              <span className="text-gradient-brand">your own two hands</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Unique is the social space for painters, sewers, sculptors, cosplayers, woodworkers and every kind of hand-crafting artist. No algorithms shouting about AI — just makers, sharing what they make.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-gradient-brand px-8 text-base font-semibold text-foreground shadow-glow transition-transform hover:-translate-y-0.5 hover:opacity-95"
              >
                <Link to="/signup">Start sharing your art</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 rounded-full px-6 text-base"
              >
                <Link to="/groups">Browse groups →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Built for the people behind the craft
            </h2>
            <p className="mt-3 text-muted-foreground">
              Whether you're young, self-taught, or just tired of feeds full of code and AI — this space is for you.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-foreground shadow-soft">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Unique — made for makers.
        </div>
      </footer>
    </div>
  );
}
