import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { fetchFeed } from "@/lib/posts";

type Profile = {
  display_name: string;
  account_type: "artist" | "buyer" | "seller";
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

  React.useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, account_type")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="rounded-3xl border border-border/60 bg-gradient-soft p-7 shadow-soft">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-foreground capitalize">
            {profile?.account_type ?? "maker"} account
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Hey, {profile?.display_name ?? "maker"} 👋
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Share what your hands made today.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={() => setComposerOpen((v) => !v)}
              className="rounded-full bg-gradient-brand text-foreground shadow-soft hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> New post
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/groups">Browse groups</Link>
            </Button>
          </div>
        </div>

        {composerOpen && (
          <div className="mt-6">
            <PostComposer />
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
                className="mt-5 rounded-full bg-gradient-brand text-foreground shadow-soft hover:opacity-95"
              >
                <Plus className="h-4 w-4" /> Create the first post
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
