"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmailFor, setCheckEmailFor] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    setCheckEmailFor(null);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/sign-in`,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    const session = data.session;

    // Email confirmation enabled: Supabase returns a user but no session until they click the link.
    if (user && !session) {
      setCheckEmailFor(user.email ?? email);
      setPassword("");
      setLoading(false);
      return;
    }

    if (user?.id && user.email) {
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          plan: "free",
          runs_this_month: 0,
        },
        { onConflict: "id" },
      );
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (checkEmailFor) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-[0_25px_80px_-30px_rgba(99,102,241,0.45)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
            <MailCheck className="h-3.5 w-3.5" />
            Email verification required
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">Check your email</h1>
          <p className="mt-3 text-sm text-slate-300">
            We sent a confirmation link to <span className="font-medium text-slate-100">{checkEmailFor}</span>. Open that
            email and confirm your account before signing in.
          </p>
          <p className="mt-2 text-sm text-slate-400">Did not get it? Check spam or promotions, then try signing up again.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/sign-in">
              <Button className="w-full" variant="outline">
                Back to sign in
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setCheckEmailFor(null);
                setEmail("");
              }}
            >
              Use a different email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-[0_25px_80px_-30px_rgba(99,102,241,0.45)] backdrop-blur-xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
          <Sparkles className="h-3.5 w-3.5" />
          Launch your AI workspace
        </div>
        <h1 className="text-2xl font-semibold text-slate-100">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">Start your free DevFlow AI workspace.</p>
        <div className="mt-4 space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSignUp();
              }
            }}
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button className="w-full" disabled={loading} onClick={handleSignUp}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account?{" "}
          <Link className="text-indigo-300 hover:text-indigo-200" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
