import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings2, Wrench, Clock, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/SiteNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-match")({
  component: AiMatchPage,
  head: () => ({ meta: [{ title: "AI Match — Unique" }] }),
});

type MatchType = "inventor" | "investor" | "startup";
const MATCH_TYPES: { value: MatchType; label: string; desc: string; emoji: string }[] = [
  { value: "inventor", label: "Inventor", desc: "Fellow makers & creators", emoji: "🔧" },
  { value: "investor", label: "Investor", desc: "Funders & supporters", emoji: "💰" },
  { value: "startup", label: "Startup", desc: "Teams building products", emoji: "🚀" },
];

const FIELDS = [
  "STEM", "Robotics", "Fashion / Sewing", "Art / Painting",
  "Woodwork", "Jewelry", "Cosplay", "Books / Writing",
  "Electronics", "3D Printing", "Other",
];

const CALL_DURATION = 20;

function AiMatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matchType, setMatchType] = React.useState<MatchType>("inventor");
  const [field, setField] = React.useState("STEM");
  const [phase, setPhase] = React.useState<"select" | "calling" | "ended">("select");
  const [countdown, setCountdown] = React.useState(CALL_DURATION);
  const [roomId, setRoomId] = React.useState("");
  const [followed, setFollowed] = React.useState(false);

  React.useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  React.useEffect(() => {
    if (phase !== "calling") return;
    if (countdown <= 0) {
      setPhase("ended");
      saveMatchHistory();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  function startMatch() {
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    setRoomId(id);
    setCountdown(CALL_DURATION);
    setFollowed(false);
    setPhase("calling");
  }

  function endEarly() {
    setPhase("ended");
    saveMatchHistory();
  }

  async function saveMatchHistory() {
    if (!user) return;
    await supabase.from("match_history").insert({
      user_id: user.id,
      matched_type: matchType,
      field,
      room_id: roomId,
      duration_seconds: CALL_DURATION - countdown,
    });
  }

  async function handleFollow() {
    if (!user || followed) return;
    setFollowed(true);
    toast.success("Connection saved! Check Match History to follow up.");
  }

  function reset() {
    setPhase("select");
    setRoomId("");
    setCountdown(CALL_DURATION);
    setFollowed(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-soft">
            <Settings2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">AI Match</h1>
            <p className="text-sm text-muted-foreground">20-second live video connections with makers</p>
          </div>
        </div>

        {phase === "select" && (
          <div className="space-y-6 rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
            <div>
              <Label className="mb-3 block text-base font-semibold">I want to meet a…</Label>
              <div className="grid grid-cols-3 gap-3">
                {MATCH_TYPES.map(({ value, label, desc, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMatchType(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                      matchType === value
                        ? "border-transparent bg-gradient-brand text-white shadow-soft"
                        : "border-border/60 bg-background/60 hover:border-brand-purple/60",
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[11px] opacity-80">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="field" className="mb-2 block text-base font-semibold">Field / Category</Label>
              <select
                id="field"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40"
              >
                {FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={startMatch}
              className="h-12 w-full rounded-xl bg-gradient-brand text-base font-semibold text-white shadow-soft hover:opacity-95"
            >
              <Settings2 className="mr-2 h-5 w-5" />
              Find My Match
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              You'll be connected via a 20-second video call. Use the wrench icon to follow your match.
            </p>
          </div>
        )}

        {phase === "calling" && (
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-glow">
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                allow="camera; microphone; display-capture"
                src={`https://meet.jit.si/UniqueMatch-${roomId}`}
                className="absolute inset-0 h-full w-full rounded-t-3xl border-0"
                title="AI Match Video Call"
              />
              {/* Countdown overlay */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-white backdrop-blur">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="font-mono text-xl font-bold tabular-nums">
                  {String(countdown).padStart(2, "0")}s
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Matching with a <span className="font-semibold capitalize text-foreground">{matchType}</span> in{" "}
                <span className="font-semibold text-foreground">{field}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={endEarly}
                className="rounded-full"
              >
                <X className="mr-1 h-4 w-4" /> End Call
              </Button>
            </div>
          </div>
        )}

        {phase === "ended" && (
          <div className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-3xl shadow-soft">
              ⏱️
            </div>
            <h2 className="font-display text-2xl font-semibold">Time's up!</h2>
            <p className="mt-2 text-muted-foreground">
              Want to stay connected with this {matchType}?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleFollow}
                disabled={followed}
                className={cn(
                  "h-11 rounded-xl px-6 font-semibold",
                  followed
                    ? "bg-green-500 text-white"
                    : "bg-gradient-brand text-white shadow-soft hover:opacity-95",
                )}
              >
                <Wrench className="mr-2 h-4 w-4" />
                {followed ? "Connection Saved ✓" : "Follow This Person"}
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                className="h-11 rounded-xl px-6"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Find Another Match
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Check your{" "}
              <button
                onClick={() => navigate({ to: "/match-history" })}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Match History
              </button>{" "}
              to report or follow up.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
