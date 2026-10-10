"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

const signupKey = "google_signup_credential";

export function ChooseUsername() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);
  const [username, setUsername] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExpired(!sessionStorage.getItem(signupKey));
      setChecking(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const credential = sessionStorage.getItem(signupKey);
    if (!credential) {
      setExpired(true);
      setMessage("Start Google sign-in again to choose your name.");
      return;
    }
    const chosen = username.trim();
    if (!/^\p{L}[\p{L}\p{N}]{2,14}$/u.test(chosen)) {
      setMessage("Use 3–15 letters or numbers, starting with a letter.");
      return;
    }
    setPending(true);
    setMessage("");
    let response: Response;
    try {
      response = await apiFetch("/auth/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, username: chosen }),
      });
    } catch {
      // Completion is safe to retry if the account was saved before the response was lost.
      setMessage("Connection lost. Try again; your username may already be saved.");
      setPending(false);
      return;
    }
    setPending(false);
    if (!response.ok) {
      if (response.status === 401) {
        sessionStorage.removeItem(signupKey);
        setExpired(true);
        setMessage("Your Google sign-in expired. Please start again.");
      } else if (response.status === 409) {
        const data = await response.json() as { detail?: string };
        setMessage(data.detail ?? "That username is already taken. Try another.");
      } else if (response.status === 422) {
        setMessage("Use 3–15 letters or numbers, starting with a letter.");
      } else {
        setMessage("Could not save your username. Please try again.");
      }
      return;
    }
    sessionStorage.removeItem(signupKey);
    router.replace("/dashboard");
  }

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-trap-canvas px-5 py-24 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(255,107,53,.12),transparent_36%),radial-gradient(ellipse_at_80%_85%,rgba(91,95,239,.16),transparent_42%)]" />
      <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5 text-sm font-black tracking-wide" aria-label="Trivia Trap home">
          <span className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary"><Zap size={20} fill="currentColor" aria-hidden="true" /></span>
          TRIVIA <span className="-ml-1 text-primary">TRAP</span>
        </Link>
        <Card className="rounded-[22px] border border-white/[0.08] bg-trap-surface px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,.3)] sm:px-9">
          <span className="grid size-11 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary"><Sparkles className="size-5" aria-hidden="true" /></span>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">One last step</p>
          <h1 className="mt-2 font-secondary text-2xl uppercase leading-tight text-white">Choose your player name</h1>
          <p className="mt-3 text-sm leading-6 text-[#a6a6ae]">This is the name your friends will see in games and on your profile.</p>
          {checking ? <p role="status" className="mt-7 flex items-center gap-2 text-sm text-[#a6a6ae]"><LoaderCircle className="size-4 animate-spin" /> Checking Google sign-in…</p> : expired ? (
            <Button asChild className="mt-7 w-full"><Link href="/login">Sign in with Google again <ArrowRight className="size-4" /></Link></Button>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="google-username" className="mb-2 block text-xs font-bold text-trap-text-soft">Player name</label>
                <Input id="google-username" name="username" required minLength={3} maxLength={15} autoComplete="username" autoFocus value={username} onChange={(event) => { setUsername(event.target.value); setMessage(""); }} placeholder="Your alter ego" />
                <p className="mt-2 text-[11px] text-[#85858f]">3–15 letters or numbers. Start with a letter.</p>
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                Save name and continue
              </Button>
            </form>
          )}
          {message && <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-[#ff9aaa]">{message}</p>}
        </Card>
      </div>
    </main>
  );
}
