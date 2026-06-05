import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, Plus, Clock } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { fetchFeed } from "@/lib/posts";

const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";
const COIN_URL = "https://i.postimg.cc/SNn7MHf5/8bea2bf5-3ece-47ae-815f-60d31587a068-removebg-preview.png";

type Profile = {
  display_name: string;
  account_type: string;
  coin_count: number | null;
};

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — Unique" }] }),
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [posts, setPosts] = React.useState<FeedPost[] | null>(null);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [coinCount, setCoinCount] = React.useState(0);

  React.useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, account_type, coin_count")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p = data as Profile;
          setProfile(p);
          setCoinCount(p.coin_count ?? 0);
        }
      });
    awardDailyLogin(user.id);
  }, [user]);

  async function awardDailyLogin(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("daily_rewards").insert({
      user_id: userId,
      awarded_date: today,
      coins: 1,
    });
    // Only update coin count on first login of the day (no duplicate error)
    if (!error) {
      const { data } = await supabase
        .from("profiles")
        .select("coin_count")
        .eq("id", userId)
        .maybeSingle();
      const current = (data as { coin_count: number | null } | null)?.coin_count ?? 0;
      await supabase.from("profiles").update({ coin_count: current + 1 }).eq("id", userId);
      setCoinCount(current + 1);
    }
  }

  const reload = React.useCallback(() => {
    fetchFeed().then(setPosts).catch(() => setPosts([]));
  }, []);

  React.useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const greeting = profile?.display_name ? `Hey, ${profile.display_name}!` : "Hey, maker!";

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero with Space Chicken mascot */}
        <div className="rounded-3xl border border-border/60 bg-gradient-soft p-7 shadow-soft">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Space Chicken + speech bubble */}
              <div className="relative mt-2 shrink-0">
                <img
                  src={CHICKEN_URL}
                  alt="Space Chicken mascot"
                  className="h-20 w-20 object-contain drop-shadow-lg"
                />
                <div className="absolute -top-8 left-16 whitespace-nowrap rounded-2xl rounded-bl-sm border border-border/60 bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft">
                  Ready to create? 🚀
                  <div className="absolute -bottom-2 left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-border/60 bg-white" />
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white capitalize">
                  {profile?.account_type ?? "maker"}
                </span>
                <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{greeting}</h1>
                <p className="mt-1 text-muted-foreground">Share what your hands made today.</p>
              </div>
            </div>

            {/* Art Galaxy Coin display */}
            <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-soft">
              <img src={COIN_URL} alt="Art Galaxy Coin" className="h-8 w-8 object-contain" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Art Galaxy Coins</p>
                <p className="font-display text-xl font-semibold">{coinCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={() => setComposerOpen((v) => !v)}
              className="rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> New post
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/groups">Browse groups</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to={`/profile/${user.id}`}>My Profile</Link>
            </Button>
          </div>
        </div>

        {composerOpen && (
          <div className="mt-6">
            <PostComposer onPost={() => { setComposerOpen(false); reload(); }} />
          </div>
        )}

        {/* Feed */}
        <div className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold">Latest from makers</h2>
            <Link to="/groups" className="text-sm font-medium text-foreground/80 hover:underline">
              All groups →
            </Link>
          </div>
          {posts === null ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-10 text-center">
              <p className="font-display text-lg font-semibold">It's quiet here…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to share something you made.
              </p>
              <Button
                onClick={() => setComposerOpen(true)}
                className="mt-5 rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-95"
              >
                <Plus className="h-4 w-4" /> Create the first post
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} onLike={reload} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
