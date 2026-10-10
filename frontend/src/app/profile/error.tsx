"use client";

import { Button } from "@/components/ui/button";

export default function ProfileError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  return (
    <div className="rounded-[20px] border border-trap-danger/30 bg-trap-surface p-8 text-center">
      <h2 className="font-secondary text-xl uppercase text-white">Could not load profile</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#a6a6ae]">The profile service is unavailable right now. Please try again.</p>
      <Button type="button" className="mt-5" onClick={reset}>Try again</Button>
    </div>
  );
}
