import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const BG_URL = "https://i.postimg.cc/43XQQYg2/opt4.jpg";
const CHICKEN_URL = "https://i.postimg.cc/g0VK0RHc/d3ec0be6-cf29-422a-b1c0-fc2ebb1ef620-removebg-preview.png";

export const Route = createFileRoute("/confirm-email")({
  component: ConfirmEmailPage,
  head: () => ({
    meta: [
      { title: "Check your email — Unique" },
      { name: "description", content: "Confirm your email to activate your Unique account." },
    ],
  }),
});

function ConfirmEmailPage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/80" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        {/* Space Chicken mascot */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <img
              src={CHICKEN_URL}
              alt="Space Chicken mascot"
              className="h-32 w-32 object-contain drop-shadow-xl"
            />
            {/* Speech bubble */}
            <div className="absolute -right-4 -top-10 max-w-[160px] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-soft">
              Almost there! Check your email ✨
              <div className="absolute -bottom-2 left-4 h-3 w-3 rotate-45 bg-white" />
            </div>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-border/60 bg-card/85 p-8 shadow-glow backdrop-blur-xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-brand flex items-center justify-center text-3xl shadow-soft">
              📬
            </div>
          </div>
          <h1 className="font-display text-3xl font-semibold">Check your inbox!</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            We sent a confirmation link to your email. Click it to activate your{" "}
            <span className="font-semibold text-foreground">Unique</span> account.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Didn't get the email? Check your spam folder or try signing up again.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-brand text-base font-semibold text-foreground shadow-soft transition-opacity hover:opacity-95"
            >
              Back to login
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border/60 bg-background/60 text-sm font-medium text-foreground transition-colors hover:bg-background/80"
            >
              Try a different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
