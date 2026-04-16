import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "@/components/PostCard";

type PostRow = {
  id: string;
  title: string;
  caption: string | null;
  image_urls: string[];
  created_at: string;
  author_id: string;
  group_id: string;
};

async function hydratePosts(rows: PostRow[]): Promise<FeedPost[]> {
  if (rows.length === 0) return [];

  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const groupIds = Array.from(new Set(rows.map((r) => r.group_id)));
  const postIds = rows.map((r) => r.id);

  const [authorsRes, groupsRes, commentsRes] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url").in("id", authorIds),
    supabase.from("groups").select("id, slug, name, icon").in("id", groupIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
  ]);

  const authors = new Map((authorsRes.data ?? []).map((a) => [a.id, a]));
  const groups = new Map((groupsRes.data ?? []).map((g) => [g.id, g]));
  const counts = new Map<string, number>();
  for (const c of commentsRes.data ?? []) {
    counts.set(c.post_id, (counts.get(c.post_id) ?? 0) + 1);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    caption: r.caption,
    image_urls: r.image_urls,
    created_at: r.created_at,
    author: authors.get(r.author_id) ?? null,
    group: groups.get(r.group_id) ?? null,
    comment_count: counts.get(r.id) ?? 0,
  }));
}

export async function fetchFeed(limit = 24): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, caption, image_urls, created_at, author_id, group_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return hydratePosts(data ?? []);
}

export async function fetchPostsByGroup(groupId: string, limit = 48): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, caption, image_urls, created_at, author_id, group_id")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return hydratePosts(data ?? []);
}

export async function fetchPostsByGroupIds(groupIds: string[], limit = 48): Promise<FeedPost[]> {
  if (groupIds.length === 0) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, caption, image_urls, created_at, author_id, group_id")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return hydratePosts(data ?? []);
}
