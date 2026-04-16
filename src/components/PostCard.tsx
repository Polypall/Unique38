import * as React from "react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { getGroupIcon } from "@/lib/group-icons";

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
  const Icon = getGroupIcon(post.group?.icon);
  const cover = post.image_urls[0];

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
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-gradient-soft">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </Link>

      <div className="space-y-2.5 p-4">
        {post.group && (
          <Link
            to="/g/$slug"
            params={{ slug: post.group.slug }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-2.5 py-1 text-[11px] font-semibold text-foreground"
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
          <span className="truncate">
            by {post.author?.display_name ?? "Anonymous"} ·{" "}
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comment_count}
          </span>
        </div>
      </div>
    </article>
  );
}
