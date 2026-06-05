import * as React from "react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Bell } from "lucide-react";
import { toast } from "sonner";
import { getGroupIcon } from "@/lib/group-icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type FeedPost = {
  id: string;
  title: string;
  caption: string | null;
  image_urls: string[];
  created_at: string;
  author: { id: string; display_name: string; avatar_url: string | null } | null;
  group: { slug: string; name: string; icon: string | null } | null;
  comment_count: number;
};

export function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth();
  const Icon = getGroupIcon(post.group?.icon);
  const cover = post.image_urls[0];
  const [reporting, setReporting] = React.useState(false);

  async function handleReport(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Log in to report posts."); return; }
    if (reporting) return;
    setReporting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      post_id: post.id,
      reason: "post_report",
    });
    setReporting(false);
    if (error) { toast.error("Could not submit report."); return; }
    toast.success("Post reported. Thank you for keeping Unique safe.");
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <Link to="/post/$postId" params={{ postId: post.id }} className="block">
        {cover ? (
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <img
              src={cover}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {post.image_urls.length > 1 && (
              <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                +{post.image_urls.length - 1}
              </span>
            )}
            {/* Report button */}
            <button
              onClick={handleReport}
              title="Report this post"
              className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-red-400 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-black/70 hover:text-red-500"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-soft">
            <Icon className="h-10 w-10 text-muted-foreground" />
            <button
              onClick={handleReport}
              title="Report this post"
              className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/30 hover:text-red-500"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        )}
      </Link>

      <div className="space-y-2.5 p-4">
        {post.group && (
          <Link
            to="/g/$slug"
            params={{ slug: post.group.slug }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-2.5 py-1 text-[11px] font-semibold text-white"
          >
            <Icon className="h-3 w-3" />
            {post.group.name}
          </Link>
        )}
        <Link to="/post/$postId" params={{ postId: post.id }}>
          <h3 className="font-display text-lg font-semibold leading-tight">{post.title}</h3>
        </Link>
        {post.caption && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.caption}</p>
        )}
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <Link
            to={post.author ? `/profile/${post.author.id}` : "/"}
            className="truncate hover:text-foreground hover:underline"
          >
            by {post.author?.display_name ?? "Anonymous"} ·{" "}
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </Link>
          <span className="inline-flex items-center gap-1 shrink-0">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comment_count}
          </span>
        </div>
      </div>
    </article>
  );
}
