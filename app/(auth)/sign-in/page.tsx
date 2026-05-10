"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const router = useRouter();

  const resendConfirmation = async () => {
    if (!email) return;
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/sign-in`,
      },
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setInfo("Confirmation email re-sent. Please check inbox/spam.");
  };

  const handleSignIn = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Email not confirmed. Please verify your inbox first.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-[0_25px_80px_-30px_rgba(99,102,241,0.45)] backdrop-blur-xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
          Secure workspace access
        </div>
        <h1 className="text-2xl font-semibold text-slate-100">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">Access your DevFlow AI dashboard and automation history.</p>
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
                void handleSignIn();
              }
            }}
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          {info && <p className="text-sm text-emerald-400">{info}</p>}
          {error.toLowerCase().includes("confirmed") && (
            <Button variant="ghost" className="w-full justify-start text-indigo-300" onClick={resendConfirmation}>
              Resend confirmation email <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button className="w-full" disabled={loading} onClick={handleSignIn}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          New here?{" "}
          <Link className="text-indigo-300 hover:text-indigo-200" href="/sign-up">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
