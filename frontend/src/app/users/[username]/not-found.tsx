import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Crosshair, Ghost, Sparkles } from "lucide-react";

export default function UserNotFound() {
    return (
        <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-trap-bg px-6 py-8 text-trap-text sm:px-12">
            <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 -z-10" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-trap-secondary/10 blur-[100px]" />

            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
                <span className="font-display text-xl tracking-tight sm:text-2xl">
                    TRIVIA<span className="text-trap-primary">TRAP</span>
                </span>
                <span className="rounded-full border border-trap-border bg-trap-panel px-3 py-1.5 font-mono text-[10px] tracking-widest text-trap-text-dim sm:text-xs">
                    PLAYER SEARCH / 404
                </span>
            </div>

            <section aria-labelledby="missing-player-title" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center py-16 text-center">
                <div aria-hidden="true" className="relative mb-10 flex h-52 w-72 items-center justify-center sm:h-60 sm:w-96">
                    <span className="absolute select-none font-display text-[140px] leading-none tracking-tighter text-trap-border/50 sm:text-[180px]">404</span>
                    <div className="relative -rotate-6 rounded-3xl border-2 border-trap-secondary-soft/40 bg-trap-surface p-7 shadow-[8px_8px_0_0_#2e2fc5]">
                        <Ghost className="h-20 w-20 text-trap-secondary-soft" strokeWidth={1.5} />
                        <span className="absolute -right-5 -top-4 rotate-12 rounded-lg border-2 border-trap-bg bg-trap-primary px-3 py-1 font-display text-2xl text-trap-bg">?</span>
                    </div>
                    <Crosshair className="absolute bottom-2 left-4 h-6 w-6 -rotate-12 text-trap-primary" />
                    <Sparkles className="absolute right-4 top-2 h-6 w-6 text-trap-host" />
                </div>

                <span className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-trap-primary">Looks like a disappearing act</span>
                <h1 id="missing-player-title" className="font-display text-4xl leading-tight sm:text-5xl">
                    Player not found<span className="text-trap-primary">.</span>
                </h1>

                <div className="mt-8 w-full rounded-xl border border-trap-border bg-trap-panel/80 px-5 py-4 text-left sm:max-w-md">
                    <p className="text-sm leading-relaxed text-trap-text-soft">Double-check the username in the link. Even trivia champions make typos.</p>
                </div>

                <Link href="/profile" className="arcade-push mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-trap-primary px-6 py-3 font-bold text-trap-bg [--arcade-shadow:#922700] sm:w-auto">
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back to my profile
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
            </section>
        </main>
    );
}
