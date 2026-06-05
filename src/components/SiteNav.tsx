import { Link, useNavigate } from "@tanstack/react-router";
import { Settings2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";

export function SiteNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={CHICKEN_URL}
            alt="Unique — Space Chicken mascot"
            className="h-10 w-10 object-contain drop-shadow"
          />
          <span className="font-display text-xl font-semibold tracking-tight">Unique</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/groups"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground sm:inline-block"
          >
            Groups
          </Link>
          {user ? (
            <>
              <Link
                to="/ai-match"
                title="AI Match"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings2 className="h-4 w-4" />
              </Link>
              <Link
                to="/match-history"
                title="Match History"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Clock className="h-4 w-4" />
              </Link>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to={`/profile/${user.id}`}>Profile</Link>
              </Button>
              <Button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                variant="outline"
                className="rounded-full"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-gradient-brand text-white shadow-soft hover:opacity-90"
              >
                <Link to="/signup">Join</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
