import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Wrench, Bell, Camera, Loader2, ExternalLink, Crown } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteNav } from "@/components/SiteNav";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/$userId")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Unique" }] }),
});

type Profile = {
  id: string;
  display_name: string;
  account_type: string;
  profile_type: string | null;
  bio: string | null;
  college: string | null;
  resume_url: string | null;
  avatar_url: string | null;
  coin_count: number | null;
};

const TYPE_COLORS: Record<string, string> = {
  inventor: "bg-purple-100 text-purple-700",
  investor: "bg-yellow-100 text-yellow-700",
  startup: "bg-blue-100 text-blue-700",
  artist: "bg-pink-100 text-pink-700",
  buyer: "bg-green-100 text-green-700",
  seller: "bg-orange-100 text-orange-700",
};

function ProfilePage() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = user?.id === userId;

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [posts, setPosts] = React.useState<FeedPost[]>([]);
  const [following, setFollowing] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const isPremium = false; // TODO: wire to Stripe subscription status

  // Edit form state
  const [bio, setBio] = React.useState("");
  const [college, setCollege] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  React.useEffect(() => {
    loadProfile();
    loadPosts();
    if (user && !isOwnProfile) checkFollowing();
  }, [userId, user]);

  async function loadProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, account_type, profile_type, bio, college, resume_url, avatar_url, coin_count")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return;
    const p = data as Profile;
    setProfile(p);
    setBio(p.bio ?? "");
    setCollege(p.college ?? "");
    setResumeUrl(p.resume_url ?? "");
    setDisplayName(p.display_name);
  }

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select(`
        id, title, caption, image_urls, created_at,
        author:profiles!posts_author_id_fkey(id, display_name, avatar_url),
        group:groups!posts_group_id_fkey(slug, name, icon),
        comment_count:comments(count)
      `)
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);
    if (data) {
      setPosts(
        (data as unknown[]).map((p: unknown) => {
          const post = p as Record<string, unknown>;
          return {
            ...post,
            comment_count: Array.isArray(post.comment_count)
              ? (post.comment_count[0] as Record<string, number>)?.count ?? 0
              : (post.comment_count as number) ?? 0,
          } as FeedPost;
        }),
      );
    }
  }

  async function checkFollowing() {
    if (!user) return;
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle();
    setFollowing(!!data);
  }

  async function toggleFollow() {
    if (!user) { navigate({ to: "/login" }); return; }
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      setFollowing(false);
      toast.success("Unfollowed.");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
      setFollowing(true);
      toast.success("Following!");
    }
  }

  async function reportProfile() {
    if (!user) { navigate({ to: "/login" }); return; }
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: userId,
      reason: "profile_report",
    });
    if (error) { toast.error("Could not submit report."); return; }
    toast.success("Report submitted. Thank you.");
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio, college, resume_url: resumeUrl })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error("Failed to save profile."); return; }
    toast.success("Profile saved!");
    setEditing(false);
    loadProfile();
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profileType = profile.profile_type ?? profile.account_type;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Profile header */}
        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-brand shadow-soft overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <label
                  title="Change avatar"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-purple text-white shadow hover:opacity-90"
                >
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !user) return;
                    const ext = file.name.split(".").pop();
                    const path = `avatars/${user.id}.${ext}`;
                    const { error: upErr } = await supabase.storage.from("public-assets").upload(path, file, { upsert: true });
                    if (upErr) { toast.error("Upload failed."); return; }
                    const { data: urlData } = supabase.storage.from("public-assets").getPublicUrl(path);
                    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user.id);
                    loadProfile();
                    toast.success("Avatar updated!");
                  }} />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="dn">Display name</Label>
                    <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 h-10 rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 rounded-xl resize-none" placeholder="Tell the community about yourself…" />
                  </div>
                  <div>
                    <Label htmlFor="college">College / University (optional)</Label>
                    <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} className="mt-1 h-10 rounded-xl" placeholder="e.g. MIT, State University…" />
                  </div>
                  <div>
                    <Label htmlFor="resume">Resume / Portfolio link (optional)</Label>
                    <Input id="resume" type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="mt-1 h-10 rounded-xl" placeholder="https://…" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={saveProfile} disabled={saving} className="rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-95">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="rounded-full">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-semibold">{profile.display_name}</h1>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", TYPE_COLORS[profileType] ?? "bg-muted text-muted-foreground")}>
                      {profileType}
                    </span>
                  </div>
                  {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {profile.college && <span>🎓 {profile.college}</span>}
                    {profile.resume_url && (
                      <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground">
                        <ExternalLink className="h-3 w-3" /> Resume / Portfolio
                      </a>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {isOwnProfile ? (
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setEditing(true)} variant="outline" className="rounded-full text-sm">
                          Edit Profile
                        </Button>
                        {!isPremium && (
                          <Link
                            to="/upgrade"
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-brand px-4 text-sm font-semibold text-white shadow-soft hover:opacity-90"
                          >
                            <Crown className="h-3.5 w-3.5" /> Upgrade — $5/mo
                          </Link>
                        )}
                        {isPremium && (
                          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-yellow-100 px-4 text-sm font-semibold text-yellow-700">
                            <Crown className="h-3.5 w-3.5" /> Premium
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={toggleFollow}
                          className={cn(
                            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all",
                            following
                              ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/30"
                              : "bg-gradient-brand text-white shadow-soft hover:opacity-90",
                          )}
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          {following ? "Following" : "Follow"}
                        </button>
                        <button
                          onClick={reportProfile}
                          title="Report this profile"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-500 hover:bg-red-100"
                        >
                          <Bell className="h-3.5 w-3.5" /> Report
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="mt-10">
          <h2 className="mb-5 font-display text-2xl font-semibold">
            {isOwnProfile ? "Your posts" : `Posts by ${profile.display_name}`}
          </h2>
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-10 text-center">
              <p className="text-muted-foreground">No posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
