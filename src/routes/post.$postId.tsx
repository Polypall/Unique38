import * as React from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Send, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getGroupIcon } from "@/lib/group-icons";

type Post = {
  id: string;
  title: string;
  caption: string | null;
  image_urls: string[];
  created_at: string;
  author_id: string;
  group_id: string;
  author: { id: string; display_name: string; avatar_url: string | null } | null;
  group: { slug: string; name: string; icon: string | null } | null;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author: { display_name: string; avatar_url: string | null } | null;
};

export const Route = createFileRoute("/post/$postId")({
  component: PostPage,
});

function PostPage() {
  const { postId } = useParams({ from: "/post/$postId" });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = React.useState<Post | null | undefined>(undefined);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [imageIdx, setImageIdx] = React.useState(0);

  const loadComments = React.useCallback(async () => {
    const { data: rows } = await supabase
      .from("comments")
      .select("id, body, created_at, author_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!rows) return;
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    const { data: authors } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", ids);
    const map = new Map((authors ?? []).map((a) => [a.id, a]));
    setComments(
      rows.map((r) => ({
        id: r.id,
        body: r.body,
        created_at: r.created_at,
        author_id: r.author_id,
        author: map.get(r.author_id) ?? null,
      })),
    );
  }, [postId]);

  React.useEffect(() => {
    let cancelled = false;
    setPost(undefined);
    setImageIdx(0);
    setComments([]);

    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, caption, image_urls, created_at, author_id, group_id")
        .eq("id", postId)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setPost(null);
        return;
      }

      const [{ data: author }, { data: group }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, avatar_url").eq("id", data.author_id).maybeSingle(),
        supabase.from("groups").select("slug, name, icon").eq("id", data.group_id).maybeSingle(),
      ]);
      if (cancelled) return;
      setPost({ ...data, author: author ?? null, group: group ?? null });
      await loadComments();
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, loadComments]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Log in to comment.");
      return;
    }
    const text = body.trim();
    if (!text) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: user.id, body: text });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBody("");
    await loadComments();
  }

  async function deleteComment(id: string) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  async function deletePost() {
    if (!post) return;
    if (!confirm("Delete this post? This can't be undone.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Post deleted.");
    navigate({ to: "/dashboard" });
  }

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h1 className="font-display text-3xl font-semibold">Post not found</h1>
          <Button asChild className="mt-6 rounded-full bg-gradient-brand text-foreground">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getGroupIcon(post.group?.icon);
  const total = post.image_urls.length;
  const isAuthor = user?.id === post.author_id;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back
        </Link>

        <article className="mt-4 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
          {/* Image carousel */}
          {total > 0 && (
            <div className="relative bg-muted">
              <img
                src={post.image_urls[imageIdx]}
                alt={post.title}
                className="max-h-[70vh] w-full object-contain"
              />
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIdx((i) => (i - 1 + total) % total)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-soft hover:bg-background"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIdx((i) => (i + 1) % total)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-soft hover:bg-background"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {post.image_urls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === imageIdx ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {post.group && (
                <Link
                  to="/g/$slug"
                  params={{ slug: post.group.slug }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-2.5 py-1 text-xs font-semibold text-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {post.group.name}
                </Link>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              {isAuthor && (
                <Button
                  onClick={deletePost}
                  variant="ghost"
                  size="sm"
                  className="ml-auto rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </div>

            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {post.title}
            </h1>

            <p className="text-sm text-muted-foreground">
              by{" "}
              <span className="font-medium text-foreground">
                {post.author?.display_name ?? "Anonymous"}
              </span>
            </p>

            {post.caption && (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {post.caption}
              </p>
            )}
          </div>
        </article>

        {/* Comments */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">
            Comments ({comments.length})
          </h2>

          {user ? (
            <form onSubmit={submitComment} className="mt-4 flex gap-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Say something kind…"
                rows={2}
                maxLength={1000}
                className="rounded-xl"
              />
              <Button
                type="submit"
                disabled={submitting || !body.trim()}
                className="self-end rounded-xl bg-gradient-brand text-foreground shadow-soft hover:opacity-95"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Log in
              </Link>{" "}
              to comment.
            </div>
          )}

          <div className="mt-6 space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {c.author?.display_name ?? "Anonymous"}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {user?.id === c.author_id && (
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {c.body}
                </p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No comments yet — be the first.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
