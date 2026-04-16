import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const LOGO_URL = "https://i.postimg.cc/W3V2QG5t/In-Shot-20251108-192211830.jpg";

export function SiteNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={LOGO_URL}
            alt="Unique logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-pink/40"
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
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/dashboard">Dashboard</Link>
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
                className="rounded-full bg-gradient-brand text-foreground shadow-soft hover:opacity-90"
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

