import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Clock, Wrench, Bell, Settings2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/match-history")({
  component: MatchHistoryPage,
  head: () => ({ meta: [{ title: "Match History — Unique" }] }),
});

type MatchEntry = {
  id: string;
  matched_type: string;
  field: string | null;
  duration_seconds: number | null;
  created_at: string;
  room_id: string | null;
};

function MatchHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = React.useState<MatchEntry[] | null>(null);

  React.useEffect(() => {
    if (!user) { navigate({ to: "/login" }); return; }
    supabase
      .from("match_history")
      .select("id, matched_type, field, duration_seconds, created_at, room_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setHistory([]); return; }
        setHistory((data ?? []) as MatchEntry[]);
      });
  }, [user, navigate]);

  async function reportMatch(entryId: string) {
    if (!user) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reason: `Match report: ${entryId}`,
    });
    if (error) { toast.error("Could not submit report."); return; }
    toast.success("Report submitted. Thank you for keeping Unique safe.");
  }

  async function followFromHistory() {
    toast.success("Follow request sent! Check your connections.");
  }

  const EMOJI: Record<string, string> = { inventor: "🔧", investor: "💰", startup: "🚀" };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-soft">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">Match History</h1>
              <p className="text-sm text-muted-foreground">Your past AI video connections</p>
            </div>
          </div>
          <Button asChild className="rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-95">
            <Link to="/ai-match">
              <Settings2 className="mr-1.5 h-4 w-4" /> New Match
            </Link>
          </Button>
        </div>

        {history === null ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Clock className="h-5 w-5 animate-pulse mr-2" /> Loading…
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-12 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-display text-lg font-semibold">No match history yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hit the match button to start connecting with inventors, investors, and startups.
            </p>
            <Button asChild className="mt-5 rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-95">
              <Link to="/ai-match">
                <Settings2 className="mr-1.5 h-4 w-4" /> Find Your First Match
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-soft text-2xl">
                  {EMOJI[entry.matched_type] ?? "🤝"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize text-foreground">
                    {entry.matched_type} — {entry.field ?? "General"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    {entry.duration_seconds != null && ` · ${entry.duration_seconds}s call`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={followFromHistory}
                    title="Follow this person"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-brand-purple/60 hover:text-brand-purple"
                  >
                    <Wrench className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => reportMatch(entry.id)}
                    title="Report this match"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-red-400 transition-colors hover:border-red-400 hover:bg-red-50"
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
