import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type GroupOption = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  parent_name: string | null;
};

const MAX_IMAGES = 6;
const MAX_BYTES = 8 * 1024 * 1024; // 8MB per image
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function PostComposer({ defaultGroupId }: { defaultGroupId?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = React.useState<GroupOption[]>([]);
  const [groupId, setGroupId] = React.useState<string | undefined>(defaultGroupId);
  const [title, setTitle] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    supabase
      .from("groups")
      .select("id, slug, name, parent_id, sort_order, parent:groups!groups_parent_id_fkey(name)")
      .order("sort_order")
      .then(({ data }) => {
        if (!data) return;
        setGroups(
          data.map((g: any) => ({
            id: g.id,
            slug: g.slug,
            name: g.name,
            parent_id: g.parent_id,
            parent_name: g.parent?.name ?? null,
          })),
        );
      });
  }, []);

  React.useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function addFiles(picked: FileList | null) {
    if (!picked) return;
    const incoming = Array.from(picked);
    const room = MAX_IMAGES - files.length;
    if (room <= 0) {
      toast.error(`You can post up to ${MAX_IMAGES} images.`);
      return;
    }
    const accepted: File[] = [];
    for (const f of incoming.slice(0, room)) {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} isn't an image.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is over 8MB.`);
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length === 0) return;
    setFiles((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
  }

  function removeAt(i: number) {
    URL.revokeObjectURL(previews[i]);
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to post.");
      return;
    }
    if (!groupId) {
      toast.error("Pick a group.");
      return;
    }
    if (files.length === 0) {
      toast.error("Add at least one image.");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("art-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("art-images").getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          group_id: groupId,
          title: title.trim(),
          caption: caption.trim() || null,
          image_urls: uploaded,
        })
        .select("id")
        .single();
      if (error) throw error;

      toast.success("Posted!");
      setTitle("");
      setCaption("");
      setFiles([]);
      setPreviews([]);
      navigate({ to: "/post/$postId", params: { postId: data.id } });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to post.");
    } finally {
      setSubmitting(false);
    }
  }

  // Group dropdown structure: cosplay parent + its children grouped, then top-level crafts
  const cosplayParent = groups.find((g) => g.slug === "cosplay");
  const cosplayChildren = groups.filter((g) => g.parent_id === cosplayParent?.id);
  const topLevelCrafts = groups.filter((g) => g.parent_id === null && g.slug !== "cosplay");

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 shadow-soft"
    >
      <div>
        <h2 className="font-display text-xl font-semibold">Share something you made</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Up to {MAX_IMAGES} photos. JPG, PNG, WEBP, GIF.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Photos</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl border border-border/60">
              <img src={src} alt="preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow-soft hover:bg-background"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {files.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-brand-pink hover:text-foreground"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="group">Group</Label>
        <Select value={groupId} onValueChange={setGroupId}>
          <SelectTrigger id="group" className="rounded-xl">
            <SelectValue placeholder="Pick a group…" />
          </SelectTrigger>
          <SelectContent>
            {cosplayParent && (
              <SelectGroup>
                <SelectLabel>Cosplay</SelectLabel>
                {cosplayChildren.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectGroup>
            )}
            <SelectGroup>
              <SelectLabel>Crafts</SelectLabel>
              {topLevelCrafts.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What is this piece called?"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="caption">Caption (optional)</Label>
        <Textarea
          id="caption"
          maxLength={2000}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tell the story behind it…"
          rows={3}
          className="rounded-xl"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-11 w-full rounded-xl bg-gradient-brand text-base font-semibold text-foreground shadow-soft hover:opacity-95"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share post"}
      </Button>
    </form>
  );
}
