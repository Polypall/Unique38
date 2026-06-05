import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BG_URL = "https://i.postimg.cc/vZrvnWpq/opt3.jpg";
const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Forgot password — Unique" },
      { name: "description", content: "Reset your Unique account password." },
    ],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/70" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="mb-6 flex items-center gap-2.5">
          <img
            src={CHICKEN_URL}
            alt="Unique logo"
            className="h-12 w-12 object-contain drop-shadow-lg"
          />
          <span className="font-display text-2xl font-semibold text-foreground drop-shadow-sm">
            Unique
          </span>
        </Link>

        <div className="w-full rounded-3xl border border-border/60 bg-card/85 p-7 shadow-glow backdrop-blur-xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-brand flex items-center justify-center text-3xl shadow-soft">
                  📧
                </div>
              </div>
              <h1 className="font-display text-2xl font-semibold">Email sent!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-brand text-base font-semibold text-foreground shadow-soft transition-opacity hover:opacity-95"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="font-display text-3xl font-semibold">Forgot password?</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 rounded-xl bg-background/70 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl bg-gradient-brand text-base font-semibold text-foreground shadow-soft hover:opacity-95"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Remember it?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
