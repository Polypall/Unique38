import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { getGroupIcon } from "@/lib/group-icons";

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
};

export const Route = createFileRoute("/groups")({
  component: GroupsIndex,
  head: () => ({
    meta: [
      { title: "Groups — Unique" },
      { name: "description", content: "Browse maker groups: cosplay, sculpture, painting, crochet and more." },
    ],
  }),
});

function GroupsIndex() {
  const [groups, setGroups] = React.useState<GroupRow[] | null>(null);

  React.useEffect(() => {
    supabase
      .from("groups")
      .select("id, slug, name, description, icon, parent_id, sort_order")
      .order("sort_order")
      .then(({ data }) => setGroups((data as GroupRow[] | null) ?? []));
  }, []);

  if (!groups) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  const cosplay = groups.find((g) => g.slug === "cosplay");
  const cosplayChildren = groups.filter((g) => g.parent_id === cosplay?.id);
  const crafts = groups.filter((g) => g.parent_id === null && g.slug !== "cosplay");

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Groups</h1>
          <p className="mt-3 text-muted-foreground">
            Find your craft. Every kind of hand-made art has a home here.
          </p>
        </header>

        {/* Cosplay */}
        {cosplay && (
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-3">
              {(() => {
                const Icon = getGroupIcon(cosplay.icon);
                return (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand text-foreground shadow-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                );
              })()}
              <div>
                <h2 className="font-display text-2xl font-semibold">{cosplay.name}</h2>
                <p className="text-sm text-muted-foreground">{cosplay.description}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cosplayChildren.map((g) => (
                <GroupTile key={g.id} group={g} />
              ))}
            </div>
          </section>
        )}

        {/* Crafts */}
        <section className="mt-14">
          <h2 className="mb-4 font-display text-2xl font-semibold">Crafts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {crafts.map((g) => (
              <GroupTile key={g.id} group={g} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function GroupTile({ group }: { group: GroupRow }) {
  const Icon = getGroupIcon(group.icon);
  return (
    <Link
      to="/g/$slug"
      params={{ slug: group.slug }}
      className="group flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-foreground/80 transition-colors group-hover:bg-gradient-brand">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-display text-lg font-semibold leading-tight">{group.name}</h3>
      {group.description && (
        <p className="text-xs leading-relaxed text-muted-foreground">{group.description}</p>
      )}
    </Link>
  );
}
