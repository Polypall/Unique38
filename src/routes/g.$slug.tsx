import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteNav } from "@/components/SiteNav";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { Button } from "@/components/ui/button";
import { fetchPostsByGroup, fetchPostsByGroupIds } from "@/lib/posts";
import { getGroupIcon } from "@/lib/group-icons";

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
};

export const Route = createFileRoute("/g/$slug")({
  component: GroupPage,
});

function GroupPage() {
  const { slug } = useParams({ from: "/g/$slug" });
  const { user } = useAuth();
  const [group, setGroup] = React.useState<GroupRow | null | undefined>(undefined);
  const [children, setChildren] = React.useState<GroupRow[]>([]);
  const [posts, setPosts] = React.useState<FeedPost[] | null>(null);
  const [composerOpen, setComposerOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setGroup(undefined);
    setPosts(null);
    setChildren([]);

    (async () => {
      const { data } = await supabase
        .from("groups")
        .select("id, slug, name, description, icon, parent_id")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setGroup(null);
        setPosts([]);
        return;
      }
      setGroup(data as GroupRow);

      // Fetch children if any
      const { data: kids } = await supabase
        .from("groups")
        .select("id, slug, name, description, icon, parent_id, sort_order")
        .eq("parent_id", data.id)
        .order("sort_order");
      if (cancelled) return;
      setChildren((kids as GroupRow[] | null) ?? []);

      // Fetch posts: if has children, aggregate; otherwise own posts
      const childIds = (kids ?? []).map((k) => k.id);
      const ids = childIds.length > 0 ? [data.id, ...childIds] : [data.id];
      const feed =
        ids.length > 1 ? await fetchPostsByGroupIds(ids) : await fetchPostsByGroup(data.id);
      if (!cancelled) setPosts(feed);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (group === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (group === null) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h1 className="font-display text-3xl font-semibold">Group not found</h1>
          <p className="mt-2 text-muted-foreground">
            We couldn't find a group called “{slug}”.
          </p>
          <Button asChild className="mt-6 rounded-full bg-gradient-brand text-foreground">
            <Link to="/groups">All groups</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getGroupIcon(group.icon);
  const isParent = children.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link to="/groups" className="text-sm text-muted-foreground hover:underline">
          ← All groups
        </Link>

        <header className="mt-4 rounded-3xl border border-border/60 bg-gradient-soft p-7 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-foreground shadow-soft">
              <Icon className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">{group.name}</h1>
              {group.description && (
                <p className="mt-1 text-muted-foreground">{group.description}</p>
              )}
            </div>
            {!isParent && user && (
              <Button
                onClick={() => setComposerOpen((v) => !v)}
                className="rounded-full bg-gradient-brand text-foreground shadow-soft hover:opacity-95"
              >
                <Plus className="h-4 w-4" /> Post
              </Button>
            )}
          </div>

          {isParent && (
            <div className="mt-5 flex flex-wrap gap-2">
              {children.map((c) => {
                const ChildIcon = getGroupIcon(c.icon);
                return (
                  <Link
                    key={c.id}
                    to="/g/$slug"
                    params={{ slug: c.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <ChildIcon className="h-3.5 w-3.5" />
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}
        </header>

        {composerOpen && !isParent && (
          <div className="mt-6">
            <PostComposer defaultGroupId={group.id} />
          </div>
        )}

        <div className="mt-8">
          {posts === null ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-10 text-center">
              <p className="font-display text-lg font-semibold">No posts here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isParent
                  ? "Pick a sub-group above to start sharing."
                  : "Be the first to share something in this group."}
              </p>
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
